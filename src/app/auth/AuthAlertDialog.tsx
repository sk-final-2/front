"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { Dispatch, SetStateAction } from "react";

export default function AuthAlertDialog({
  showLoginAlert,
  setShowLoginAlert,
}: {
  showLoginAlert: boolean;
  setShowLoginAlert: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useLoadingRouter();

  const handleLoginRedirect = () => {
    setShowLoginAlert(false);
    router.replace("/login");
  };
  return (
    <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
          <AlertDialogDescription>
            이 페이지에 접근하려면 로그인이 필요합니다. 로그인 페이지로
            이동하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={handleLoginRedirect}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
