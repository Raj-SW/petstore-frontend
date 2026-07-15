import useSEO from "../../hooks/useSEO";
import PtHero from "./sections/PtHero";
import PtProcess from "./sections/PtProcess";
import PtDestinations from "./sections/PtDestinations";
import PtTrustBar from "./sections/PtTrustBar";
import PtFinalCta from "./sections/PtFinalCta";
import "./PetTravel.css";

const PetTravelPage = () => {
  useSEO(
    "Pet Travel & Relocation",
    "Relocating abroad with your pet? VitalPaws handles documentation, veterinary exams, export paperwork and travel prep for stress-free pet relocation from Mauritius."
  );

  return (
    <div className="pt-page">
      <PtHero />
      <PtProcess />
      <PtDestinations />
      <PtTrustBar />
      <PtFinalCta />
    </div>
  );
};

export default PetTravelPage;
