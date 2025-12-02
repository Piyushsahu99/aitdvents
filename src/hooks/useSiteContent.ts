import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteContent {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_type: string;
  content_value: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  order_index: number;
}

interface PageBanner {
  id: string;
  page: string;
  position: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  background_color: string | null;
  is_active: boolean;
  order_index: number;
}

export function useSiteContent(page: string, section?: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [page, section]);

  const fetchContent = async () => {
    try {
      let query = supabase
        .from("site_content")
        .select("*")
        .eq("page", page)
        .eq("is_active", true);

      if (section) {
        query = query.eq("section", section);
      }

      const { data, error } = await query;

      if (error) throw error;

      const contentMap: Record<string, string> = {};
      (data as SiteContent[] || []).forEach((item) => {
        contentMap[`${item.section}_${item.content_key}`] = item.content_value || item.link_url || "";
      });
      setContent(contentMap);
    } catch (error) {
      console.error("Error fetching site content:", error);
    } finally {
      setLoading(false);
    }
  };

  const getValue = (section: string, key: string, fallback: string = ""): string => {
    return content[`${section}_${key}`] || fallback;
  };

  return { content, loading, getValue, refetch: fetchContent };
}

export function usePageBanners(page: string, position?: string) {
  const [banners, setBanners] = useState<PageBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [page, position]);

  const fetchBanners = async () => {
    try {
      let query = supabase
        .from("page_banners")
        .select("*")
        .eq("page", page)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (position) {
        query = query.eq("position", position);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBanners((data as PageBanner[]) || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  return { banners, loading, refetch: fetchBanners };
}