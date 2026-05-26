import distDataJson from '@/data/data_dist.json';
import geoDataJson from '@/data/data_geo.json';
import destinationJson from "@/data/destination.json";

export type TDist = {
  dist_id: string;
  dist_name: string;
  lower_node: string;
  upper_node: string;
  distance: number;
  dist_type: 'pvb' | 'trotoar';
};

export type TGeo = {
  node_id: string;
  node_name: string;
  latitude: number;
  longitude: number;
  node_type: string;
}

export const distData = distDataJson as TDist[];

export const geoData = geoDataJson as TGeo[];

export const destionationData = destinationJson as TGeo[];