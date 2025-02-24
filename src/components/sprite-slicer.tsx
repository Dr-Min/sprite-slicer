"use client";  // 이 줄을 파일 최상단에 추가


import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JSZip from 'jszip';
import Image from 'next/image';

// 타입 정의
interface JsonPreview {
  name: string;
  size: string;
}

interface ImagePreview {
  url: string;
  name: string;
  size: string;
}

interface Sprite {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

interface JsonFrameData {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface JsonData {
  frames: Record<string, JsonFrameData>;
  meta: {
    size: {
      w: number;
      h: number;
    };
  };
}

// HTMLImageElement 타입 정의 추가
declare global {
  interface Window {
    Image: new (width?: number, height?: number) => HTMLImageElement;
  }
}

const SpriteSlicer = () => {
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [imageFile, setImageFile] = useState<HTMLImageElement | null>(null);
  const [slicedSprites, setSlicedSprites] = useState<Sprite[]>([]);
  const [jsonPreview, setJsonPreview] = useState<JsonPreview | null>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const [baseFileName, setBaseFileName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 파일 이름에서 확장자를 제거하는 함수
  const removeFileExtension = (filename: string): string => {
    return filename.split('.').slice(0, -1).join('.');
  };

  // 초기화 함수
  const handleReset = () => {
    setJsonData(null);
    setImageFile(null);
    setSlicedSprites([]);
    setJsonPreview(null);
    setImagePreview(null);
    setBaseFileName('');
    setIsDownloading(false);
  };

  // ZIP 파일 생성 및 다운로드 함수
  const handleDownloadAll = async () => {
    if (slicedSprites.length === 0) return;

    setIsDownloading(true);
    try {
      const zip = new JSZip();
      // 기본 폴더 생성 (파일 이름 기반)
      const folder = zip.folder(baseFileName);
      
      if (!folder) {
        throw new Error('ZIP 폴더 생성 실패');
      }

      // 각 스프라이트를 PNG 파일로 변환하여 ZIP에 추가
      slicedSprites.forEach((sprite, index) => {
        const imageData = sprite.dataUrl.split(',')[1];
        folder.file(`${index}.png`, imageData, {base64: true});
      });

      // ZIP 파일 생성 및 다운로드
      const content = await zip.generateAsync({type: 'blob'});
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = `${baseFileName}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // JSON 파일 처리
  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setJsonPreview({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB'
      });

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const parsedJson = JSON.parse(result) as JsonData;
            setJsonData(parsedJson);
          }
        } catch (error) {
          console.error('JSON 파싱 에러:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // 스프라이트 슬라이싱 로직
  const sliceSpritesCallback = React.useCallback((img: HTMLImageElement, json: JsonData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = json.meta.size.w;
    canvas.height = json.meta.size.h;
    
    const sprites: Sprite[] = [];

    const frameEntries = Object.entries(json.frames);
    
    frameEntries.forEach(([, frameData], index) => {
      const { x, y, w, h } = frameData.frame;
      
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = w;
      spriteCanvas.height = h;
      const spriteCtx = spriteCanvas.getContext('2d');
      
      if (spriteCtx) {
        spriteCtx.drawImage(img, x, y, w, h, 0, 0, w, h);
        
        const spriteName = `${baseFileName}_${index}`;
        
        sprites.push({
          name: spriteName,
          dataUrl: spriteCanvas.toDataURL(),
          width: w,
          height: h
        });
      }
    });

    setSlicedSprites(sprites);
  }, [baseFileName]);

  // 이미지 파일 처리 수정
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBaseFileName(removeFileExtension(file.name));

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result) {
          setImagePreview({
            url: result.toString(),
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB'
          });

          const img = new window.Image(1, 1); // 초기 크기 지정
          img.onload = () => {
            setImageFile(img);
            if (jsonData) {
              sliceSpritesCallback(img, jsonData);
            }
          };
          img.src = result.toString();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 컴포넌트 수정
  const ImagePreviewComponent = React.useMemo(() => {
    if (!imagePreview?.url) return null;
    
    return (
      <div className="mt-2 p-2 border rounded-lg">
        <div
          style={{
            width: '100%',
            height: '300px',
            backgroundImage: `url(${imagePreview.url})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            imageRendering: 'pixelated'
          }}
        />
      </div>
    );
  }, [imagePreview?.url]);

  React.useEffect(() => {
    if (jsonData && imageFile) {
      sliceSpritesCallback(imageFile, jsonData);
    }
  }, [jsonData, imageFile, sliceSpritesCallback]);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Sprite Sheet Slicer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top button area */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={slicedSprites.length === 0 || isDownloading}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                slicedSprites.length === 0 || isDownloading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isDownloading ? 'Downloading...' : 'Download All'}
            </button>
          </div>

          {/* File upload section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JSON upload */}
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="cursor-pointer flex flex-col items-center">
                <div className="w-8 h-8 mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl">📄</span>
                </div>
                <span>Upload JSON File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonUpload}
                  className="hidden"
                />
              </label>
              
              {/* JSON preview */}
              {jsonPreview && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="font-medium text-sm">Uploaded JSON:</p>
                  <p className="text-sm text-gray-600">{jsonPreview.name}</p>
                  <p className="text-xs text-gray-500">Size: {jsonPreview.size}</p>
                  {jsonData && (
                    <div className="mt-2 text-xs">
                      <p>Frame count: {Object.keys(jsonData.frames).length}</p>
                      <p>Image size: {jsonData.meta.size.w}x{jsonData.meta.size.h}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Image upload */}
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="cursor-pointer flex flex-col items-center">
                <div className="w-8 h-8 mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl">🖼️</span>
                </div>
                <span>Upload Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Image preview */}
              {imagePreview && (
                <div className="mt-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="font-medium text-sm">Uploaded Image:</p>
                    <p className="text-sm text-gray-600">{imagePreview.name}</p>
                    <p className="text-xs text-gray-500">Size: {imagePreview.size}</p>
                  </div>
                  {ImagePreviewComponent}
                </div>
              )}
            </div>
          </div>

          {/* Results section */}
          {slicedSprites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Sliced Sprites</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {slicedSprites.map((sprite, index) => (
                  <div key={index} className="border rounded-lg p-2">
                    <div
                      style={{
                        width: sprite.width * 2,
                        height: sprite.height * 2,
                        backgroundImage: `url(${sprite.dataUrl})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        imageRendering: 'pixelated'
                      }}
                      className="mx-auto"
                    />
                    <p className="text-xs mt-2 truncate">{sprite.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions section */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">How to Use</h3>
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              This tool helps you slice sprite sheets into individual sprite frames. Simply:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Export your sprite sheet from Aseprite as a PNG file</li>
              <li>Export the JSON data (Hash format) from Aseprite</li>
              <li>Upload both files to this tool</li>
              <li>Download the automatically sliced sprite frames</li>
            </ol>
            <p className="mt-6 text-sm italic">
              The tool uses Aseprite&apos;s JSON format to accurately slice your sprite sheet into individual frames.
              Perfect for game development and pixel art animation projects.
            </p>
            <p className="mt-4 text-sm text-blue-600">
              Happy game making! 🎮✨
            </p>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default SpriteSlicer;