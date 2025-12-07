import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Expense } from "./ExpenseForm";
import { format } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const categoryLabels: Record<string, string> = {
  meals: "Meals & Entertainment",
  transportation: "Transportation",
  accommodation: "Accommodation",
  office: "Office Supplies",
  communication: "Communication",
  travel: "Travel",
  training: "Training & Development",
  other: "Other",
};

export function ExpenseList({
  expenses,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: ExpenseListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No expenses found. Create your first expense to get started.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{format(expense.date, "MMM d, yyyy")}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{categoryLabels[expense.category] || expense.category}</TableCell>
                <TableCell>{expense.employee}</TableCell>
                <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[expense.status]}>
                    {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onView(expense)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {expense.status === "draft" && (
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {expense.status === "submitted" && (
                        <>
                          <DropdownMenuItem onClick={() => onApprove(expense.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(expense.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
