"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Ship } from "lucide-react";

export default function SailorsPage() {
  const [sailors, setSailors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSailors = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/users?limit=100");
        if (!res.ok) throw new Error("Failed to fetch sailors");
        const data = await res.json();
        setSailors(Array.isArray(data) ? data : data.users || []);
      } catch (err: any) {
        setFetchError(err.message || "Failed to load sailors");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSailors();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">All Sailors</h1>
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-center mb-6">
          {fetchError}
        </div>
      )}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading sailors...</div>
      ) : sailors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No sailors found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-6">
          {sailors.map((sailor, index) => (
            <Link
              href={`/profile/${sailor._id || sailor.id || sailor.userId}`}
              key={sailor._id || sailor.id || sailor.userId || index}
              className="group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-1 rounded-full overflow-hidden bg-white dark:bg-slate-800">
                    <Avatar
                      className="h-full w-full border-4"
                      style={{ boxShadow: "0 0 0 4px #22c55e, 0 0 0 8px #ec4899" }}
                    >
                      <AvatarImage
                        className="object-cover w-full h-full rounded-full"
                        src={
                          sailor.profileImage ||
                          sailor.image ||
                          "/placeholder.svg?height=200&width=200&query=sailor%20profile"
                        }
                        alt={sailor.name || "Sailor"}
                      />
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {getInitials(sailor.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {sailor.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {sailor.role || sailor.title || "Sailor"}
                </p>
                <Badge
                  variant="outline"
                  className="text-xs font-normal px-2 border-gray-200 dark:border-gray-700"
                >
                  <Ship className="h-3 w-3 mr-1" />
                  {Math.floor(Math.random() * 100) + 10} Voyages
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "S";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
