import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Upload, Image, Video, File, X, Loader2 } from 'lucide-react';

interface MediaUploaderProps {
  bucketName: 'proposal-logos' | 'proposal-images' | 'proposal-videos' | 'proposal-attachments';
  acceptedTypes: string;
  maxSize?: number; // in MB
  onUploadSuccess: (url: string, fileName: string) => void;
  existingFiles?: Array<{ url: string; name: string }>;
  onRemoveFile?: (url: string) => void;
  multiple?: boolean;
  showPreview?: boolean;
}

const MediaUploader = ({
  bucketName,
  acceptedTypes,
  maxSize = 10,
  onUploadSuccess,
  existingFiles = [],
  onRemoveFile,
  multiple = false,
  showPreview = true
}: MediaUploaderProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension || '')) {
      return <Video className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Error",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onUploadSuccess(publicUrl, file.name);
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast({
        title: "Error",
        description: "Only one file can be uploaded at a time",
        variant: "destructive",
      });
      return;
    }

    fileArray.forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = async (url: string) => {
    if (onRemoveFile) {
      onRemoveFile(url);
    }
    
    // Optionally remove from storage
    try {
      const fileName = url.split('/').pop();
      if (fileName && user) {
        await supabase.storage
          .from(bucketName)
          .remove([`${user.id}/${fileName}`]);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const getBucketLabel = () => {
    switch (bucketName) {
      case 'proposal-logos': return 'Logo';
      case 'proposal-images': return 'Images';
      case 'proposal-videos': return 'Videos';
      case 'proposal-attachments': return 'Attachments';
      default: return 'Files';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-dashed'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="font-medium">Upload {getBucketLabel()}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {maxSize}MB • Accepted: {acceptedTypes}
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose {multiple ? 'Files' : 'File'}
                </>
              )}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              multiple={multiple}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1 text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Files */}
      {showPreview && existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded {getBucketLabel()}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {existingFiles.map((file, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                    </div>
                    {onRemoveFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.url)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Preview for images */}
                  {bucketName === 'proposal-images' && (
                    <div className="mt-2">
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
