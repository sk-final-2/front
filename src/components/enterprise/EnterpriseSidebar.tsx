"use client";

import { useState } from "react";
import {
  Home,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "대시보드", count: null },
    { id: "jobs", icon: Briefcase, label: "채용 공고", count: null },
    { id: "applicants", icon: Users, label: "지원자", count: null },
    { id: "interviews", icon: Calendar, label: "면접 일정", count: null },
    { id: "analytics", icon: BarChart3, label: "분석", count: null },
  ];

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-card border-r border-border h-screen flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border transition-all duration-300">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 ">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">채용 관리</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 h-8 w-8 cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-10 cursor-pointer ${
                  isCollapsed ? "px-2" : "px-3"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="w-4 h-4" />
                {!isCollapsed && (
                  <>
                    <span className="ml-2">{item.label}</span>
                    {item.count && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">김채용</p>
              <p className="text-xs text-muted-foreground truncate">
                HR 매니저
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
