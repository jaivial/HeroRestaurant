import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Modal, Button, Text, Heading } from '@/components/ui';
import type { QRCodeModalProps } from './types';

export function QRCodeModal({ isOpen, onClose, menuId, menuTitle }: QRCodeModalProps) {
  const theme = useAtomValue(themeAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(300);
  const [qrColor, setQrColor] = useState('#000000');

  const fetchShortUrl = useCallback(async () => {
    if (!menuId) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/menu/${menuId}/short-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to generate short URL');

      const result = await response.json();
      
      if (result.success) {
        setShortUrl(result.data.shortUrl);
      } else {
        throw new Error(result.error?.message || 'Failed to generate short URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  }, [menuId]);

  const generateQRCode = useCallback(async () => {
    if (!shortUrl || !canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, shortUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: theme === 'dark' ? '#000000' : '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (err) {
      setError('Failed to generate QR code');
    }
  }, [shortUrl, qrSize, qrColor, theme]);

  useEffect(() => {
    if (isOpen && menuId) {
      fetchShortUrl();
    }
  }, [isOpen, menuId, fetchShortUrl]);

  useEffect(() => {
    if (shortUrl) {
      generateQRCode();
    }
  }, [shortUrl, generateQRCode]);

  const downloadPNG = useCallback(() => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${menuTitle || 'menu'}-qr-code.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }, [menuTitle]);

  const downloadSVG = useCallback(async () => {
    if (!shortUrl) return;

    try {
      const svgString = await QRCode.toString(shortUrl, {
        type: 'svg',
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: theme === 'dark' ? '#000000' : '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${menuTitle || 'menu'}-qr-code.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download SVG');
    }
  }, [shortUrl, qrSize, qrColor, theme, menuTitle]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate QR Code"
      size="md"
      closeOnBackdrop
      closeOnEscape
    >
      <div className="p-8 space-y-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-4" />
            <Text color="secondary">Generating QR code...</Text>
          </div>
        )}

        {error && !isLoading && (
          <div className={`p-6 rounded-[1.5rem] ${theme === 'dark' ? 'bg-apple-red/20 border border-apple-red/30' : 'bg-apple-red/10 border border-apple-red/20'}`}>
            <Text className="text-apple-red">{error}</Text>
            <Button
              onClick={fetchShortUrl}
              className="mt-4"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        {shortUrl && !isLoading && !error && (
          <>
            <div className="flex flex-col items-center space-y-6">
              <div className={`p-6 rounded-[2.2rem] ${theme === 'dark' ? 'bg-white' : 'bg-white'} shadow-apple-lg`}>
                <canvas ref={canvasRef} className="block" />
              </div>

              <div className="text-center space-y-2">
                <Heading level={4} className="text-lg">Scan to view menu</Heading>
                <Text color="tertiary" className="text-sm font-mono break-all max-w-md">
                  {shortUrl}
                </Text>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Text weight="medium" className="mb-2 block">Size</Text>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    step="50"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: theme === 'dark' 
                        ? 'linear-gradient(to right, #007AFF 0%, #007AFF ' + ((qrSize - 200) / 3) + '%, #3A3A3C ' + ((qrSize - 200) / 3) + '%, #3A3A3C 100%)'
                        : 'linear-gradient(to right, #007AFF 0%, #007AFF ' + ((qrSize - 200) / 3) + '%, #E5E5EA ' + ((qrSize - 200) / 3) + '%, #E5E5EA 100%)'
                    }}
                  />
                  <Text color="tertiary" className="text-xs mt-1">{qrSize}px</Text>
                </div>

                <div>
                  <Text weight="medium" className="mb-2 block">Color</Text>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-[44px] h-[44px] rounded-[1rem] cursor-pointer border-2 border-apple-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-current/10">
              <Button
                onClick={downloadPNG}
                className="flex-1 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-[1rem] h-[44px]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </Button>

              <Button
                onClick={downloadSVG}
                className="flex-1 bg-apple-purple hover:bg-apple-purple/90 text-white rounded-[1rem] h-[44px]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download SVG
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
