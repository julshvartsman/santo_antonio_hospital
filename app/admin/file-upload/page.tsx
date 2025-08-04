"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/components/providers/AppProvider";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Trash2,
} from "lucide-react";

export default function FileUploadPage() {
  const { language } = useApp();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">File Upload</h1>
        <p className="text-gray-600 mt-2">
          Upload sustainability data files for processing
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-gray-600 mb-4">
                Supported formats: CSV, Excel (.xlsx, .xls), JSON
              </p>
              <Button asChild>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  Choose Files
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Label>
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Uploads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">
                      sustainability_data_march.csv
                    </h4>
                    <p className="text-sm text-gray-600">
                      Uploaded 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="default"
                    className="flex items-center space-x-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Processed</span>
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-orange-500" />
                  <div>
                    <h4 className="font-medium">energy_usage_february.xlsx</h4>
                    <p className="text-sm text-gray-600">Uploaded 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Processing</span>
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-medium">
                      water_consumption_january.csv
                    </h4>
                    <p className="text-sm text-gray-600">Uploaded 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="default"
                    className="flex items-center space-x-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Processed</span>
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please ensure your files follow the required format for proper
                processing.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">Required Format:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>
                  CSV files should have headers: Date, Hospital, Department,
                  Metric, Value
                </li>
                <li>Excel files should follow the same column structure</li>
                <li>Date format: YYYY-MM-DD</li>
                <li>Values should be numeric</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
