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
import { MoreHorizontal, Eye, CheckCircle, XCircle, Plane } from "lucide-react";
import { TravelRequest } from "./TravelRequestForm";
import { format } from "date-fns";

interface TravelRequestListProps {
  requests: TravelRequest[];
  onView: (request: TravelRequest) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  manager_approved: "bg-purple-100 text-purple-800",
  hr_approved: "bg-indigo-100 text-indigo-800",
  approved: "bg-green-100 text-green-800",
  ongoing: "bg-yellow-100 text-yellow-800",
  completed: "bg-teal-100 text-teal-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  manager_approved: "Manager Approved",
  hr_approved: "HR Approved",
  approved: "Approved",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TravelRequestList({
  requests,
  onView,
  onApprove,
  onReject,
  onDelete,
}: TravelRequestListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>Return</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No travel requests found. Create your first travel request to get started.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    {request.name}
                  </div>
                </TableCell>
                <TableCell>{request.employee}</TableCell>
                <TableCell>
                  {request.destinations.length > 0
                    ? `${request.destinations[0].city}, ${request.destinations[0].country}${
                        request.destinations.length > 1 ? ` +${request.destinations.length - 1}` : ""
                      }`
                    : "-"}
                </TableCell>
                <TableCell>{format(request.departureDate, "MMM d, yyyy")}</TableCell>
                <TableCell>{format(request.returnDate, "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  ${request.estimatedBudget.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[request.status]}>
                    {statusLabels[request.status]}
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
                      <DropdownMenuItem onClick={() => onView(request)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {request.status === "submitted" && (
                        <>
                          <DropdownMenuItem onClick={() => onApprove(request.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(request.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(request.id)} className="text-red-600">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Request
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
