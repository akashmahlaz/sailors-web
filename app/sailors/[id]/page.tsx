"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ship,
  MapPin,
  Calendar,
  Anchor,
  Film,
  ImageIcon,
  Mic,
  Users,
  Share2,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function SailorProfilePage() {
  const params = useParams();
  const [sailor, setSailor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSailorData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch sailor details
        const sailorRes = await fetch(`/api/users/${params.id}`);
        if (!sailorRes.ok) {
          // If not found by ID, try fetching from the users list
          const usersRes = await fetch("/api/users");
          if (!usersRes.ok) throw new Error("Failed to fetch sailor details");
          const users = await usersRes.json();
          const sailorData = users.find((u: any) => u._id === params.id);
          if (!sailorData) throw new Error("Sailor not found");
          setSailor(sailorData);
        } else {
          const sailorData = await sailorRes.json();
          setSailor(sailorData);
        }

        // Fetch sailor's videos
        const videosRes = await fetch(`/api/videos?userId=${sailor?.userId || params.id}`);
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideos(videosData.videos || []);
        }

        // Fetch sailor's photos
        const photosRes = await fetch(`/api/photos?userId=${sailor?.userId || params.id}`);
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          setPhotos(photosData.photos || []);
        }

        // Fetch sailor's podcasts
        const podcastsRes = await fetch(`/api/podcasts?userId=${sailor?.userId || params.id}`);
        if (podcastsRes.ok) {
          const podcastsData = await podcastsRes.json();
          setPodcasts(podcastsData.podcasts || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load sailor data");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSailorData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading sailor profile...</div>
      </div>
    );
  }

  if (error || !sailor) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-500">{error || "Sailor not found"}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative h-48 bg-gradient-to-r from-slate-700 to-slate-900">
          {/* Cover Image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800">
                <AvatarImage
                  src={sailor.profileImage || sailor.image || "/placeholder.svg"}
                  alt={sailor.name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(sailor.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {sailor.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {sailor.role || sailor.title || "Sailor"}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {sailor.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {sailor.location}
                  </Badge>
                )}
                {sailor.experience && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {sailor.experience} Years
                  </Badge>
                )}
                {sailor.boatType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Ship className="h-3 w-3" />
                    {sailor.boatType}
                  </Badge>
                )}
              </div>
            </div>

            <div className="md:ml-auto mt-4 md:mt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${sailor.name}'s Profile`,
                      text: `Check out ${sailor.name}'s profile on Sailors Web`,
                      url: window.location.href,
                    }).catch(console.error);
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(window.location.href);
                    alert('Profile link copied to clipboard!');
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {sailor.email && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a 
                    href={`mailto:${sailor.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
            </div>
          </div>

          {sailor.bio && (
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {sailor.bio}
            </p>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Videos ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Photos ({photos.length})
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Podcasts ({podcasts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          {videos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No videos shared yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/videos/${video.id}`}>
                      <div className="relative aspect-video">
                        <img
                          src={video.thumbnail_url || "/placeholder.svg"}
                          alt={video.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="text-white">
                            <Anchor className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                          {video.description}
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {photos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No photos shared yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/photos/${photo.id}`}>
                      <div className="relative aspect-square">
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="podcasts" className="space-y-4">
          {podcasts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No podcasts shared yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcasts.map((podcast) => (
                <Card key={podcast.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/podcasts/${podcast.id}`}>
                      <div className="relative aspect-video">
                        <img
                          src={podcast.cover_image || "/placeholder.svg"}
                          alt={podcast.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-1">{podcast.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                          {podcast.description}
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
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
