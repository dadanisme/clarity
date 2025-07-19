"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FileSpreadsheet, Download } from "lucide-react";
import { ExcelImport } from "./excel-import";
import { ExcelExport } from "./excel-export";
import { InlineFeatureGate } from "@/components/features/feature-gate";
import { FeatureFlag } from "@clarity/types";
import { useFeatureAccess } from "@/hooks/use-features";

interface ActionsDropdownProps {
  onImportComplete: () => void;
}

export function ActionsDropdown({ onImportComplete }: ActionsDropdownProps) {
  // Check if user has access to any of the features in the dropdown
  const { data: hasExcelExport = false } = useFeatureAccess(
    FeatureFlag.EXCEL_EXPORT
  );
  const { data: hasExcelImport = false } = useFeatureAccess(
    FeatureFlag.EXCEL_IMPORT
  );

  // Don't render the dropdown if user has no access to any features
  if (!hasExcelExport && !hasExcelImport) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <InlineFeatureGate feature={FeatureFlag.EXCEL_EXPORT}>
          <ExcelExport
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
                <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                  New
                </span>
              </DropdownMenuItem>
            }
          />
        </InlineFeatureGate>
        <InlineFeatureGate feature={FeatureFlag.EXCEL_IMPORT}>
          <ExcelImport
            onImportComplete={onImportComplete}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Import Excel
              </DropdownMenuItem>
            }
          />
        </InlineFeatureGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
