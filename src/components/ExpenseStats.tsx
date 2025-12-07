import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";
import { Expense } from "./ExpenseForm";

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const submittedExpenses = expenses.filter((exp) => exp.status === "submitted");
  const approvedExpenses = expenses.filter((exp) => exp.status === "approved");
  const pendingExpenses = expenses.filter(
    (exp) => exp.status === "draft" || exp.status === "submitted"
  );

  const stats = [
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toFixed(2)}`,
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      title: "Total Reports",
      value: expenses.length.toString(),
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Approved",
      value: `$${approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Pending",
      value: pendingExpenses.length.toString(),
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
