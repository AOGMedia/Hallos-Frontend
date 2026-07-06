"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GlowTabs, type TabOption } from "@/components/ui/GlowTabs";
import {
  Calendar,
  RefreshCw,
  // Mail,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  listLiveClassesExternal,
  type LiveClass,
} from "@/services/liveClassService";
import { deleteLiveClass } from "@/lib/api/live";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { listSeries } from "@/services/seriesService";
import { CourseCard } from "@/components/course/CourseCard";
import { SeriesScheduleCard } from "@/components/schedule/SeriesScheduleCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import LiveDotIcon from "@/components/icons/LiveDotIcon";
import ScheduledSummary from "@/components/liveEvents/ScheduledSummary";
import RegistrationsModal from "@/components/liveEvents/RegistrationsModal";

import { useCurrencyPreference } from "@/hooks/useCurrencyPreference";

export function ScheduleTabsClient() {
  const [activeTab, setActiveTab] = useState("live-classes");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  const { currency } = useCurrencyPreference();

  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [viewRegistrationsClass, setViewRegistrationsClass] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteLiveClass = (id: string) => {
    setDeleteClassId(id);
  };

  const confirmDeleteClass = async () => {
    if (!deleteClassId) return;
    const id = deleteClassId;
    setDeleteClassId(null);
    try {
      await deleteLiveClass(id);
      queryClient.invalidateQueries({ queryKey: ["schedule-live-classes"] });
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const errorObj = err as { hasPurchases?: boolean; message?: string };
        if (errorObj.hasPurchases) {
          setAlertMessage("This live class has been purchased by users and cannot be deleted. Please contact support.");
        } else if (errorObj.message && errorObj.message.includes("currently streaming")) {
          setAlertMessage("Cannot delete a live class that is currently streaming. Please end the session first.");
        } else {
          setAlertMessage(errorObj.message || "Failed to delete live class. Please try again.");
        }
      } else if (err instanceof Error) {
        setAlertMessage(err.message || "Failed to delete live class. Please try again.");
      } else {
        setAlertMessage("Failed to delete live class. Please try again.");
      }
    }
  };

  // Fetch live classes
  const { data: liveClassesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["schedule-live-classes"],
    queryFn: listLiveClassesExternal,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Fetch live series
  const { data: seriesData, isLoading: isLoadingSeries } = useQuery({
    queryKey: ["schedule-live-series"],
    queryFn: () => listSeries(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const classes = useMemo(() => liveClassesData || [], [liveClassesData]);
  const series = useMemo(() => seriesData || [], [seriesData]);

  // Filter user's own classes and series
  const myClasses = useMemo(() => {
    return classes.filter((c) => String(c.userId) === String(userId));
  }, [classes, userId]);

  const mySeries = useMemo(() => {
    return series.filter((s) => String(s.userId) === String(userId));
  }, [series, userId]);

  // Check if user has any live classes or series
  const hasMyContent = myClasses.length > 0 || mySeries.length > 0;

  // Dynamic tabs based on user content
  const dynamicTabs = useMemo(() => {
    const baseTabs: TabOption[] = [
      {
        id: "live-classes",
        label: "Live Classes",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        id: "live-series",
        label: "Live Series",
        icon: <RefreshCw className="w-5 h-5" />,
      },
    ];

    if (hasMyContent) {
      baseTabs.push({
        id: "my-live-classes",
        label: "My Live Classes",
        icon: <LiveDotIcon width={20} height={20} />,
      });
    }

    // baseTabs.push({
    //   id: "invites",
    //   label: "Invites",
    //   icon: <Mail className="w-5 h-5" />,
    // });

    return baseTabs;
  }, [hasMyContent]);

  // Filter classes based on search query
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const query = searchQuery.toLowerCase();
    return classes.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.creatorName?.toLowerCase().includes(query),
    );
  }, [classes, searchQuery]);

  // Filter series based on search query
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return series;
    const query = searchQuery.toLowerCase();
    return series.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        `${s.creator?.firstname} ${s.creator?.lastname}`
          .toLowerCase()
          .includes(query),
    );
  }, [series, searchQuery]);

  // Filter user's own classes based on search
  const filteredMyClasses = useMemo(() => {
    if (!searchQuery.trim()) return myClasses;
    const query = searchQuery.toLowerCase();
    return myClasses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.creatorName?.toLowerCase().includes(query),
    );
  }, [myClasses, searchQuery]);

  // Filter user's own series based on search
  const filteredMySeries = useMemo(() => {
    if (!searchQuery.trim()) return mySeries;
    const query = searchQuery.toLowerCase();
    return mySeries.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        `${s.creator?.firstname} ${s.creator?.lastname}`
          .toLowerCase()
          .includes(query),
    );
  }, [mySeries, searchQuery]);

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return "TBA";
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins <= 0) return "TBA";

      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours > 0) {
        return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
      }
      return `${mins} mins`;
    } catch {
      return "TBA";
    }
  };

  const getLiveClassHref = (c: LiveClass) => {
    const isOwner = String(c.userId) === String(userId);
    const isMuxClass = Boolean(c.mux_playback_id || c.playback_url);
    const isZegoClass = Boolean(c.isZegoCloud && !isMuxClass);

    if (isZegoClass) {
      if (isOwner) {
        return `/live/${c.id}/room`;
      }
      return `/live/join/${c.id}`;
    }

    if (isOwner) {
      return `/live/creator/${c.id}`;
    }

    return `/live/${c.id}`;
  };

  // Live Classes Content
  const liveClassesContent = isLoadingClasses ? (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ) : filteredClasses.length === 0 ? (
    <div className="text-gray-400 text-center py-10 bg-[#1F2636] rounded-xl border border-white/5">
      <p>
        {searchQuery
          ? "No classes match your search."
          : "No scheduled classes found."}
      </p>
    </div>
  ) : (
    <div className="flex items-stretch overflow-x-auto gap-6 pb-4 scrollbar-hide -mx-4 px-4">
      {filteredClasses.map((c) => {
        const href = getLiveClassHref(c);

        const isLiveNow =
          c.status === "live" ||
          (c.status === "scheduled" &&
            c.startTime &&
            c.endTime &&
            (() => {
              const now = new Date();
              const start = new Date(c.startTime);
              const end = new Date(c.endTime);
              return now >= start && now <= end;
            })());

        const scheduledFor =
          c.status === "scheduled" && !isLiveNow && c.startTime
            ? c.startTime
            : undefined;

        return (
          <div key={c.id} className="flex-shrink-0 w-[300px] md:w-[350px]">
            <CourseCard
              id={c.id}
              title={c.title}
              description={c.description || ""}
              instructor={c.creatorName || "Unknown Instructor"}
              thumbnail={c.thumbnailUrl || "/images/video-placeholder.svg"}
              avatar={"/avatars/alex-chapman.jpg"}
              price={
                typeof c.price === "number" ? c.price : Number(c.price) || 0
              }
              duration={formatDuration(c.startTime, c.endTime)}
              posted={
                c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""
              }
              rating={0}
              reviews={"0"}
              isLive={Boolean(isLiveNow)}
              scheduledFor={scheduledFor}
              isPurchased={false}
              href={href}
            />
          </div>
        );
      })}
    </div>
  );

  // Live Series Content
  const liveSeriesContent = isLoadingSeries ? (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ) : filteredSeries.length === 0 ? (
    <div className="text-gray-400 text-center py-10 bg-[#1F2636] rounded-xl border border-white/5">
      <p>
        {searchQuery
          ? "No series match your search."
          : "No live series scheduled."}
      </p>
    </div>
  ) : (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Live Series ({filteredSeries.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSeries.map((s) => {
          const baseCurrency = s.pricing?.base?.currency || s.currency || 'NGN';
          const seriesPrice = s.pricing
            ? (baseCurrency === 'USD' ? s.pricing.usd : s.pricing.ngn)
            : typeof s.price === 'string' ? parseFloat(s.price) : (s.price || 0);
          const isLive = (s.stats?.liveSessions || 0) > 0;

          return (
            <SeriesScheduleCard
              key={s.id}
              id={s.id}
              title={s.title}
              description={s.description || ""}
              instructor={
                s.creator
                  ? `${s.creator.firstname} ${s.creator.lastname}`
                  : "Unknown Instructor"
              }
              thumbnail={s.thumbnailUrl || "/images/video-placeholder.svg"}
              avatar={"/avatars/alex-chapman.jpg"}
              price={seriesPrice}
              currency={baseCurrency}
              href={`/series/${s.id}`}
              isLive={isLive}
            />
          );
        })}
      </div>
    </div>
  );

  // My Live Classes Content (user's own classes and series)
  const myLiveClassesContent = (
    <div className="space-y-8">
      {filteredMyClasses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            My Live Classes ({filteredMyClasses.length})
          </h3>
          <div className="flex flex-col gap-6">
            {filteredMyClasses.map((c) => {
              const href = getLiveClassHref(c);
              const isLiveNow =
                c.status === "live" ||
                (c.status === "scheduled" &&
                  c.startTime &&
                  c.endTime &&
                  (() => {
                    const now = new Date();
                    const start = new Date(c.startTime);
                    const end = new Date(c.endTime);
                    return now >= start && now <= end;
                  })());

              return (
                <ScheduledSummary
                  key={c.id}
                  title={c.title}
                  currency={currency}
                  price={String(c.price || 0)}
                  date={c.startTime || new Date().toISOString()}
                  startTime={c.startTime || new Date().toISOString()}
                  endTime={c.endTime || new Date().toISOString()}
                  inviteCount={0}
                  paymentCompleted={0}
                  totalEarned={0}
                  onShareInvite={() => {
                    const link = `${window.location.origin}/live/${c.id}`;
                    navigator.clipboard.writeText(link).then(() => {
                      alert('Class link copied to clipboard!');
                    }).catch(() => {
                      // Fallback for browsers that don't support clipboard API
                      const el = document.createElement('textarea');
                      el.value = link;
                      document.body.appendChild(el);
                      el.select();
                      document.execCommand('copy');
                      document.body.removeChild(el);
                      alert('Class link copied to clipboard!');
                    });
                  }}
                  onViewPayments={() => {
                    setViewRegistrationsClass({ id: c.id, title: c.title });
                  }}
                  onViewEarnings={() => {
                    // TODO: Implement view earnings
                    console.log('View earnings for class:', c.id);
                  }}
                  onStartClass={() => {
                    window.location.href = href;
                  }}
                  onDelete={!isLiveNow ? () => handleDeleteLiveClass(c.id) : undefined}
                />
              );
            })}
          </div>
        </div>
      )}

      {filteredMySeries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            My Live Series ({filteredMySeries.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMySeries.map((s) => {
              const baseCurrency = s.pricing?.base?.currency || s.currency || 'NGN';
              const seriesPrice = s.pricing
                ? (baseCurrency === 'USD' ? s.pricing.usd : s.pricing.ngn)
                : typeof s.price === 'string' ? parseFloat(s.price) : (s.price || 0);
              const isLive = (s.stats?.liveSessions || 0) > 0;

              return (
                <SeriesScheduleCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  description={s.description || ""}
                  instructor={
                    s.creator
                      ? `${s.creator.firstname} ${s.creator.lastname}`
                      : "Unknown Instructor"
                  }
                  thumbnail={s.thumbnailUrl || "/images/video-placeholder.svg"}
                  avatar={"/avatars/alex-chapman.jpg"}
                  price={seriesPrice}
                  currency={baseCurrency}
                  href={`/series/${s.id}`}
                  isLive={isLive}
                />
              );
            })}
          </div>
        </div>
      )}

      {filteredMyClasses.length === 0 && filteredMySeries.length === 0 && (
        <div className="text-gray-400 text-center py-10 bg-[#1F2636] rounded-xl border border-white/5">
          <p>
            {searchQuery
              ? "No content matches your search."
              : "You don't have any live classes or series yet."}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full overflow-hidden scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Live Schedules
          </h1>
          <LiveDotIcon
            width={18}
            height={18}
            className="sm:w-7 sm:h-7 animate-pulse"
          />        </div>

        {/* Search Bar - Mobile First */}
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1F2636] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#6a57e5] transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <GlowTabs
        tabs={dynamicTabs}
        activeTabId={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "live-classes" && <div>{liveClassesContent}</div>}

        {activeTab === "live-series" && <div>{liveSeriesContent}</div>}

        {activeTab === "my-live-classes" && <div>{myLiveClassesContent}</div>}

        {activeTab === "invites" && (
          <div className="text-zinc-400 text-center py-10 bg-[#1F2636] rounded-xl border border-white/5">
            <p>No invites at the moment.</p>
          </div>
        )}
      </div>

      {viewRegistrationsClass && (
        <RegistrationsModal
          isOpen={!!viewRegistrationsClass}
          onClose={() => setViewRegistrationsClass(null)}
          entityId={viewRegistrationsClass.id}
          entityTitle={viewRegistrationsClass.title}
          entityType="class"
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteClassId}
        title="Delete Live Class?"
        message="Are you sure you want to delete this class? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteClass}
        onCancel={() => setDeleteClassId(null)}
        isDestructive={true}
      />
      <AlertModal 
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        message={alertMessage || ""}
      />
    </div>
  );
}
