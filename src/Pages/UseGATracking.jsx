import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useGATracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-QYKCPE6W3F", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

export default useGATracking;
