import {
  FaMoneyBillWave, FaGift, FaChartLine, FaUtensils, FaGamepad,
  FaShoppingBasket, FaBook, FaFileInvoiceDollar, FaCar, FaTag,
  FaHome, FaPlane, FaPiggyBank, FaHeartbeat, FaTshirt, FaBolt,
} from 'react-icons/fa';

// Anh xa ten icon (luu trong DB) -> component react-icons
const MAP = {
  FaMoneyBillWave, FaGift, FaChartLine, FaUtensils, FaGamepad,
  FaShoppingBasket, FaBook, FaFileInvoiceDollar, FaCar, FaTag,
  FaHome, FaPlane, FaPiggyBank, FaHeartbeat, FaTshirt, FaBolt,
};

// Danh sach icon de chon khi tao danh muc
export const ICON_NAMES = Object.keys(MAP);

export function CategoryIcon({ name, className }) {
  const Icon = MAP[name] || FaTag;
  return <Icon className={className} />;
}
