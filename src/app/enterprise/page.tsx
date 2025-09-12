"use client";

import { Analytics } from "@/components/enterprise/Analytics";
import { Applicants } from "@/components/enterprise/Applicants";
import Dashboard from "@/components/enterprise/Dashboard";
import { AdminSidebar } from "@/components/enterprise/EnterpriseSidebar";
import { Interviews } from "@/components/enterprise/Interviews";
import JobPostings from "@/components/enterprise/JobPostings";
import { useState } from "react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>(
    sessionStorage.getItem("activeTab") || "dashboard",
  );

  const handleTabChange = (tab: string) => {
    sessionStorage.setItem("activeTab", tab);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard handleTabChange={handleTabChange} />;
      case "jobs":
        return <JobPostings />;
      case "applicants":
        return <Applicants />;
      case "interviews":
        return <Interviews />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard handleTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
