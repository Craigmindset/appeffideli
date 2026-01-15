"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  meal_subscription: string | null;
  meal_subscription_status: string | null;
  role: string;
  created_at: string;
  sub_cost: number | null;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const rowsPerPage = 30;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, planFilter]);

  const fetchUsers = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("users_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
    }

    // Apply plan filter
    if (planFilter !== "all") {
      if (planFilter === "none") {
        filtered = filtered.filter((user) => !user.meal_subscription);
      } else {
        filtered = filtered.filter(
          (user) => user.meal_subscription === planFilter
        );
      }
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPlan = (plan: string | null) => {
    if (!plan) return "No Plan";
    return plan.replace("meal_", "").charAt(0).toUpperCase() + plan.slice(6);
  };

  const formatCost = (cost: number | null | undefined) => {
    if (!cost) return "N/A";
    return `₦${cost.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          Manage all registered users and their subscriptions
        </p>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">All Users</CardTitle>
          <CardDescription className="dark:text-gray-400">
            View and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="none">No Plan</SelectItem>
                <SelectItem value="meal_basic">Basic</SelectItem>
                <SelectItem value="meal_premium">Premium</SelectItem>
                <SelectItem value="meal_vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border dark:border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700 dark:bg-gray-700/50">
                  <TableHead className="dark:text-gray-200">Name</TableHead>
                  <TableHead className="dark:text-gray-200">Email</TableHead>
                  <TableHead className="dark:text-gray-200">Phone</TableHead>
                  <TableHead className="dark:text-gray-200">Plan</TableHead>
                  <TableHead className="dark:text-gray-200">Cost</TableHead>
                  <TableHead className="dark:text-gray-200">Status</TableHead>
                  <TableHead className="dark:text-gray-200">Role</TableHead>
                  <TableHead className="dark:text-gray-200">
                    Joined Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 dark:text-gray-400"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 dark:text-gray-400"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <TableCell className="font-medium dark:text-white">
                        {user.full_name || "N/A"}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {user.email}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {user.phone || "N/A"}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatPlan(user.meal_subscription)}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatCost(user.sub_cost)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.meal_subscription_status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {user.meal_subscription_status || "inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
