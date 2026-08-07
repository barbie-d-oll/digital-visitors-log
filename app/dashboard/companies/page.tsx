"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, MoreHorizontal, Plus } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  PageHeader,
  SearchField,
  StatusBadge,
  Toolbar,
} from "../../components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const companies = [
  {
    id: "hws",
    name: "HWS Company",
    email: "admin@hws.com",
    phone: "0240000000",
    status: "Active",
  },
];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return companies;
    }

    return companies.filter((company) =>
      [company.name, company.email, company.phone, company.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [search]);

  return (
    <div className="space-y-8">
        <PageHeader
          title="Companies"
          description="Manage registered companies, subscriptions, and visitor desk access."
          actions={
            <Button asChild>
              <Link href="/dashboard/companies/add">
                <Plus className="size-4" />
                Add Company
              </Link>
            </Button>
          }
        />

        <DashboardPanel
          title="Company Directory"
          description="Search and review company access records."
          contentClassName="p-0"
        >
          <Toolbar>
            <SearchField
              label="Search companies"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company, email, phone..."
              className="md:max-w-sm"
            />
            <p className="text-sm text-muted-foreground">
              {filteredCompanies.length} of {companies.length} companies
            </p>
          </Toolbar>

          {filteredCompanies.length > 0 ? (
            <Table className="min-w-[760px]">
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="px-5">Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="px-5 font-medium">
                      {company.name}
                    </TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>
                      <StatusBadge status={company.status} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Open actions for ${company.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Company</DropdownMenuLabel>
                          <DropdownMenuItem>Edit details</DropdownMenuItem>
                          <DropdownMenuItem>View visitors</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No companies found"
                description="No registered company matches the current search."
                icon={Building2}
              />
            </div>
          )}
        </DashboardPanel>
    </div>
  );
}
