"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GoogleDriveService } from "@/lib/googleDrive";

interface DriveFile {
  id: string;
  name: string;
}

export default function Home() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/drive");
      const data = await response.json();
      if (data.files) {
        setFiles(data.files);
      } else {
        setError("Failed to fetch files");
      }
    } catch (err) {
      setError("Error fetching files");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !content) {
      setError("Please provide both file name and content");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: `${fileName}.json`, content }),
      });

      if (response.ok) {
        const data = await response.json();
        setFiles([...files, data.file]);
        setFileName("");
        setContent("");
      } else {
        setError("Failed to upload file");
      }
    } catch (err) {
      setError("Error uploading file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Google Drive File Manager</h1>

      {/* File Upload Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <Input
            type="text"
            placeholder="File name (e.g., data)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder="JSON content"
            value={content}
            onChange={(e:any) => setContent(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload to Google Drive"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>

      {/* File List Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>File ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length > 0 ? (
            files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{file.id}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No files found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}