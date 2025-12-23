import Link from "next/link";
import { FaFilePdf } from "react-icons/fa";

interface ResearchReportLinkProps {
  url?: string;
  companyName: string;
}

/**
 * Component that displays a link to the research report PDF
 */
export default function ResearchReportLink({
  url,
  companyName,
}: ResearchReportLinkProps) {
  if (!url) {
    return null;
  }

  return (
    <div className="mb-6">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
      >
        <FaFilePdf className="text-red-400" />
        <span className="text-sm font-medium">
          View {companyName} Research Report (PDF)
        </span>
      </Link>
    </div>
  );
}

