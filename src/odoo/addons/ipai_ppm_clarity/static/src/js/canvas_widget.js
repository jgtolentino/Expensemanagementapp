/** @odoo-module **/

/**
 * IPAI PPM Clarity - Canvas Widget Client Script
 * Provides client-side widget interactions for Odoo backend
 */

import { Component, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * Canvas Widget Component
 * Renders a single widget on the canvas based on its configuration
 */
export class ClarityCanvasWidget extends Component {
    static template = "ipai_ppm_clarity.CanvasWidget";
    static props = {
        widgetId: { type: Number },
        config: { type: Object },
    };

    setup() {
        this.rpc = useService("rpc");
        this.state = useState({
            data: null,
            loading: true,
            error: null,
        });

        onWillStart(async () => {
            await this.loadWidgetData();
        });
    }

    async loadWidgetData() {
        try {
            this.state.loading = true;
            const result = await this.rpc("/web/dataset/call_kw", {
                model: "ipai.canvas.widget",
                method: "evaluate_data",
                args: [[this.props.widgetId]],
                kwargs: {},
            });
            this.state.data = result;
            this.state.error = null;
        } catch (error) {
            this.state.error = error.message || "Failed to load widget data";
        } finally {
            this.state.loading = false;
        }
    }

    get formattedValue() {
        if (!this.state.data) return "";
        const value = this.state.data.value;
        const format = this.props.config.format || "number";

        switch (format) {
            case "percentage":
                return `${Math.round(value)}%`;
            case "currency":
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(value);
            case "hours":
                return `${Math.round(value)}h`;
            default:
                return new Intl.NumberFormat().format(value);
        }
    }
}

/**
 * Canvas Grid Component
 * Manages the grid layout and widget positioning
 */
export class ClarityCanvasGrid extends Component {
    static template = "ipai_ppm_clarity.CanvasGrid";
    static props = {
        canvasId: { type: Number },
        layoutColumns: { type: Number },
        widgets: { type: Array },
        configMode: { type: Boolean },
    };

    setup() {
        this.state = useState({
            dragging: null,
            dropTarget: null,
        });
    }

    get gridStyle() {
        return {
            "grid-template-columns": `repeat(${this.props.layoutColumns}, 1fr)`,
        };
    }

    onDragStart(widgetId, event) {
        if (!this.props.configMode) return;
        this.state.dragging = widgetId;
        event.dataTransfer.setData("text/plain", widgetId);
    }

    onDragOver(x, y, event) {
        if (!this.props.configMode) return;
        event.preventDefault();
        this.state.dropTarget = { x, y };
    }

    onDrop(x, y, event) {
        if (!this.props.configMode) return;
        event.preventDefault();
        const widgetId = parseInt(event.dataTransfer.getData("text/plain"));
        this.trigger("widget-move", { widgetId, x, y });
        this.state.dragging = null;
        this.state.dropTarget = null;
    }
}

/**
 * Progress Ring SVG Component
 */
export class ProgressRing extends Component {
    static template = "ipai_ppm_clarity.ProgressRing";
    static props = {
        percentage: { type: Number },
        color: { type: String },
        size: { type: Number, optional: true },
    };

    get size() {
        return this.props.size || 80;
    }

    get radius() {
        return (this.size - 16) / 2;
    }

    get circumference() {
        return 2 * Math.PI * this.radius;
    }

    get dashOffset() {
        const percentage = Math.min(100, Math.max(0, this.props.percentage));
        return this.circumference * (1 - percentage / 100);
    }

    get viewBox() {
        return `0 0 ${this.size} ${this.size}`;
    }

    get center() {
        return this.size / 2;
    }
}

// Register components
registry.category("components").add("ClarityCanvasWidget", ClarityCanvasWidget);
registry.category("components").add("ClarityCanvasGrid", ClarityCanvasGrid);
registry.category("components").add("ProgressRing", ProgressRing);
