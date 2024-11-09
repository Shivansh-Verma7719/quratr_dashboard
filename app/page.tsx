"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getAllPlaces,
  getLikesOfPlace,
  getDislikesOfPlace,
  getAllUsersOfPlaceLikes,
  getAllUsersOfPlaceDislikes,
  calculateOnboardingStats,
} from "./helpers";
import { Card } from "@nextui-org/react";
import { Search } from "@/components/ui/search";
import { MapPin, Building2, Heart, ThumbsDown, TrendingUp } from "lucide-react";
import { ChartConfig } from "@/components/ui/chart";
import { PieChart } from "@/components/ui/pie-chart";
import { HistoryLineChart } from "@/components/ui/historylinechart";
import { RadialChart } from "@/components/ui/radial-chart";
import { Laptop } from "lucide-react";

export interface Place {
  id: string;
  name: string;
  image: string;
  matchScore: number;
  tags: string;
  rating: number;
  locality: string;
  group_experience: string;
  isLastCard?: boolean;
  description: string;
  address: string;
  city_name: string;
  likes?: number;
  dislikes?: number;
}

const chartConfig = {
  likes: {
    label: "Likes",
    color: "hsl(152, 75%, 50%)",
  },
  dislikes: {
    label: "Dislikes",
    color: "hsl(0, 84%, 61%)",
  },
} satisfies ChartConfig;

interface ImpressionData {
  label: string;
  value: number;
  fill: string;
}

interface LikesData {
  created_at: string;
  user_id: string;
  place_id: number;
}

interface DislikesData {
  created_at: string;
  user_id: string;
  place_id: number;
}

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  [key: string]: string | number;
}

export default function Home() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [impressionsData, setImpressionsData] = useState<ImpressionData[]>([]);
  const [likesData, setLikesData] = useState<LikesData[]>([]);
  const [dislikesData, setDislikesData] = useState<DislikesData[]>([]);
  const [, setUsersDataLikes] = useState<UserProfile[]>([]);
  const [, setUsersDataDislikes] = useState<UserProfile[]>([]);
  const [radialChartData, setRadialChartData] = useState<
    {
      attribute: string;
      likesData: number;
      dislikesData: number;
    }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 748);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await getAllPlaces();
      if (error) {
        console.error("Error fetching places:", error);
      } else {
        setPlaces(data || []);
      }
    };
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (inputValue.length === 0) {
      setIsSearchFocused(false);
    }
  }, [inputValue]);

  const handlePlaceSelection = async (place: Place) => {
    const { data: likes, error: likesError } = await getLikesOfPlace(place.id);
    const { data: dislikes, error: dislikesError } = await getDislikesOfPlace(
      place.id
    );
    const { data: userData, error: usersError } = await getAllUsersOfPlaceLikes(
      place.id
    );
    const { data: userDataDislikes, error: usersDislikesError } =
      await getAllUsersOfPlaceDislikes(place.id);

    if (usersError || usersDislikesError) {
      console.error("Error fetching users:", usersError, usersDislikesError);
    }

    setUsersDataLikes(userData || []);
    setUsersDataDislikes(userDataDislikes || []);
    setLikesData(likes || []);
    setDislikesData(dislikes || []);

    if (likesError || dislikesError) {
      console.error(
        "Error fetching likes or dislikes:",
        likesError,
        dislikesError
      );
    }

    setImpressionsData([
      {
        label: "Likes",
        value: likes?.length || 0,
        fill: "hsl(152, 75%, 50%)",
      },
      {
        label: "Dislikes",
        value: dislikes?.length || 0,
        fill: "hsl(0, 84%, 61%)",
      },
    ]);

    setSelectedPlace({
      ...place,
      likes: likes?.length,
      dislikes: dislikes?.length,
    });

    const onboardingStats = await calculateOnboardingStats(
      userData || [],
      userDataDislikes || []
    );
    setRadialChartData(onboardingStats);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen relative bg-background">
        <Laptop className="w-16 h-16 text-gray-400" />

        <div className="text-2xl font-bold p-5">
          Please use a desktop to view this page
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen relative bg-background">
      {/* Search Section */}
      <motion.div
        className="flex flex-col items-center w-full absolute top-0 left-0 bg-background z-50 pt-8 pb-4"
        animate={{
          y: isSearchFocused ? "0" : "30vh",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.h1
          className="text-4xl font-bold mb-8"
          animate={{ scale: isSearchFocused ? 0.8 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          Quratr Brand Dashboard
        </motion.h1>

        <div className="w-full max-w-2xl px-4">
          <Search
            items={places}
            onSelectionChange={() => setIsSearchFocused(true)}
            onInputChange={(value: string) => setInputValue(value)}
            placeholder="Search places..."
            onSelectedPlace={(place: Place) => handlePlaceSelection(place)}
          />
        </div>
      </motion.div>

      {/* Dashboard Content */}
      {selectedPlace && (
        <motion.div
          className="w-full px-4 md:px-8 py-6 mt-[200px]" // Added margin-top to account for search bar height
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isSearchFocused ? 1 : 0,
            y: isSearchFocused ? 0 : 20,
            display: isSearchFocused ? "block" : "none",
          }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* First Row - 3 Equal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Place Info Card */}
            <Card className="p-4 h-[200px]">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedPlace.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <p className="text-sm">{selectedPlace.locality}</p>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building2 size={16} className="mr-2" />
                    <p className="text-sm">{selectedPlace.city_name}</p>
                  </div>
                  <div className="flex items-center">
                    {/* <Rating
                      style={{ maxWidth: 100 }}
                      value={selectedPlace.rating}
                      readOnly={true}
                    /> */}
                  </div>
                </div>
              </div>
            </Card>

            {/* Likes Card */}
            <Card className="p-4 h-[200px] relative overflow-hidden">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4">Likes</h3>
                <div className="flex items-center justify-center flex-grow">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-pink-500 mb-2" />
                    <p className="text-3xl font-bold text-pink-500">
                      {selectedPlace.likes || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                <Heart className="w-full h-full text-pink-500" />
              </div>
            </Card>

            {/* Dislikes Card */}
            <Card className="p-4 h-[200px] relative overflow-hidden">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4">Dislikes</h3>
                <div className="flex items-center justify-center flex-grow">
                  <div className="text-center">
                    <ThumbsDown className="w-12 h-12 text-red-500 mb-2" />
                    <p className="text-3xl font-bold text-red-500">
                      {selectedPlace.dislikes || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                <ThumbsDown className="w-full h-full text-red-500" />
              </div>
            </Card>
          </div>

          {/* Second Row - 35/75 Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <Card className="md:col-span-4 p-4 h-[300px] md:h-[500px]">
              <PieChart
                data={impressionsData}
                config={chartConfig}
                title="Impressions"
                subtitle="Showing total swipes on this place in Quratr app"
              />
            </Card>
            <Card className="md:col-span-8 p-4 h-[300px] md:h-[500px]">
              <HistoryLineChart
                title="Engagement History"
                description="Timeline of likes and dislikes"
                likesData={likesData}
                dislikesData={dislikesData}
                config={chartConfig}
                subtitle="Showing historical engagement data"
                icon={<TrendingUp />}
              />
            </Card>
          </div>

          {/* Three Rows of 3 Cards Each */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <Card className="p-4 h-[300px] md:h-[500px]">
              <RadialChart
                title="User Attributes"
                description="Showing user attributes of the users whoengage"
                data={radialChartData}
                chartConfig={chartConfig}
              />
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
