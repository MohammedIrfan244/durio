"use client";

import dynamic from "next/dynamic";

const UserExplorer = dynamic(() => import("@/components/admin/user-explorer"), {
  ssr: false,
});

export default UserExplorer;