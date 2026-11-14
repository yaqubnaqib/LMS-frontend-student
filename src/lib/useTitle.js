import { useEffect } from "react";

export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – EduLib` : "EduLib — find and hold library books";
  }, [title]);
}
