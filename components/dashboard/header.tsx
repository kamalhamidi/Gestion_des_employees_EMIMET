"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LogOut, Hammer } from "lucide-react";

interface HeaderProps {
    userName?: string;
    userRole?: string;
}

export function Header({ userName, userRole }: HeaderProps) {
    return (
        <header className="border-b">
            <div className="flex h-16 items-center px-6 gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <Hammer className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">EMIMET</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-right">
                        <p className="font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userRole}</p>
                    </div>
                    <ModeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
