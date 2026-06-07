// Metro/NativeWind CSS importlari icin ambient tipler.
// (expo start ilk calistiginda uretilen expo-env.d.ts de bunlari saglar.)
declare module "*.css";

declare module "*.module.css" {
  const styles: { readonly [key: string]: string };
  export default styles;
}
