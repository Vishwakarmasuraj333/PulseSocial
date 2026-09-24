"use client";

import React from "react";
import { UniversalSocialConnectModal } from "@/components/social/UniversalSocialConnectModal";

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBrandModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBrandModalProps) {
  return (
    <UniversalSocialConnectModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a social channel to this Brand"
      onSuccess={onSuccess}
    />
  );
}

export default CreateBrandModal;
