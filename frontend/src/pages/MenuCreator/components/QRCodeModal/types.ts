export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuId: string | null;
  menuTitle: string | null;
}
