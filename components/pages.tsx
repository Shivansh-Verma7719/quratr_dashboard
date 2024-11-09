"use client";
import {
  Home,
  // DoorOpen,
  // User,
  // MessageCircleReply,
  // Settings,
} from "lucide-react";

// const isLoggedIn = async () => {
//   const supabase = createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   return user;
// };

const getPages = () => {
  const pages = [
    { name: "Home", href: "/", icon: Home },
    // { name: "About", href: "/#about", icon: DoorOpen },
    // { name: "Feedback", href: "/feedback", icon: MessageCircleReply },
    // { name: "Discover", href: "/discover", icon: BadgePlus },
    // { name: "Feed", href: "/feed", icon: Newspaper },
    // { name: "Login", href: "/login", icon: User },
    // { name: "Register", href: "/register", icon: Settings },
  ];
  return pages;
};

export { getPages };
