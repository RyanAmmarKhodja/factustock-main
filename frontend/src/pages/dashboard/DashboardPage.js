import { useAuth } from "../../context/AuthContext";
import { PageHeader, StatCard, Card, CardHeader } from "../../components/ui/UI";
import styles from "./DashboardPage.module.css";
import {
  FileText,
  History,
  Truck,
  Users,
  Store,
  UserPlus,
  Package,
  Plus,
  CirclePlus,
  ClipboardList,
  TrendingUp,
  CreditCard,
  Landmark,
  Archive,
  FileCheckCorner,
  FilePlusCorner,
  PackagePlus,
  DatabaseZap,
  RefreshCcw,
  Table2,
  FileDigit,
  Blocks,
  Wallet,
  HandCoins,
  Warehouse,
  FileBarChart,
  LifeBuoy,
  BellDot,
  SlidersHorizontal,
  Headset,
} from "lucide-react";
import DashboardTile from "../../components/dashboard/DashboardTile";
import MiniBarChart from "../../components/dashboard/MiniBarChart";
import SectionLabel from "../../components/dashboard/SectionLabel";

/* ─────────────────────────────────────────────
   Dashboard.jsx  (main page)
───────────────────────────────────────────── */
const C = {
  blue: "#1a6fb4",
  blueDark: "#005eab",
  teal: "#2E6F40",
  tealDark: "#2E6F40",
  emerald: "#0C6C17",
  emeraldDark: "#00590B",
  purple: "#8b2be2",
  purpleDark: "#673ab7",
  orange: "#f59e0b",
  orangeDark: "#d97706",
  charcoal: "#1e1e1e",
  white: "#fff",
};

const gap = 8;
const iconSize = 26;
const iconProps = { size: iconSize, strokeWidth: 1.6 };

export default function DashboardPage() {
  const noop = () => {};

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "wrap",
        justifyContent: "start",
        flexWrap: "wrap",

        gap: 24,
        margin: "0 auto",
      }}
    >
      {/* ── FACTURATION ── */}
      <div style={{ maxWidth: "300px" }}>
        <SectionLabel>Facturation</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={C.blue}
            onClick={noop}
            height={200}
          >
            <FileText
              height={90}
              width={90}
              style={{ strokeWidth: "1.5px" }}
            />
            <h2>Créer une facture</h2>
          </DashboardTile>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
            <DashboardTile
              color={C.white}
              backgroundColor={C.blueDark}
              onClick={noop}
              height={"100%"}
            >
              <Archive
                height={70}
                width={70}
                style={{ strokeWidth: "1.5px" }}
              />
              <h3>Consulter mes factures</h3>
            </DashboardTile>
            <div style={{ display: "flex", flexDirection: "column", gap }}>
              <DashboardTile
                color={C.white}
                backgroundColor={C.blue}
                onClick={noop}
                height={160}
              >
                <FilePlusCorner
                  height={70}
                  width={70}
                  style={{ strokeWidth: "1.5px" }}
                />
                <h3>Créer un bon</h3>
              </DashboardTile>
              <DashboardTile
                color={C.white}
                backgroundColor={C.blue}
                onClick={noop}
                height={160}
              >
                <FileCheckCorner
                  height={70}
                  width={70}
                  style={{ strokeWidth: "1.5px" }}
                />
                <h3>Voir tous les bons</h3>
              </DashboardTile>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUITS ── */}
      <div style={{ maxWidth: "300px" }}>
        <SectionLabel>Produits</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={C.purple}
            height={200}
            onClick={noop}
          >
            <Blocks
              height={90}
              width={90}
              style={{ strokeWidth: "1.5px" }}
            />
            <div style={{ textAlign: "left" }}>
              <h2>Nouvelle Entrée</h2>
              <h4 style={{ paddingTop: ".1em" }}>(Mise à jour stock)</h4>
            </div>
          </DashboardTile>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
            <DashboardTile
              color={C.white}
              backgroundColor={C.purpleDark}
              height={160}
              onClick={noop}
            >
              <Table2
                height={70}
                width={70}
                style={{ strokeWidth: "1.5px" }}
              />

              <h3>Voir les produits</h3>
            </DashboardTile>

            <DashboardTile
              color={C.white}
              backgroundColor={C.purpleDark}
              height={160}
              onClick={noop}
            >
              <PackagePlus
                height={70}
                width={70}
                style={{ strokeWidth: "1.5px" }}
              />
              <h3>Créer un produit</h3>
            </DashboardTile>

            <DashboardTile
              color={C.white}
              backgroundColor={C.purpleDark}
              height={160}
              onClick={noop}
            >
             <History
                height={70}
                width={70}
                style={{ strokeWidth: "1.5px" }}
              />
              <h3>Mouvements de Stock</h3>
            </DashboardTile>

            {/* <DashboardTile
              color={C.white}
              backgroundColor={C.purpleDark}
              height={160}
              onClick={noop}
            >
              <RefreshCcw
                height={100}
                width={100}
                style={{ strokeWidth: "1.5px" }}
              />
              <div style={{ textAlign: "left" }}>
                <h3>Importer/Exporter</h3>
                <h4 style={{ paddingTop: ".1em" }}>
                  Des Données
                </h4>
              </div>
            </DashboardTile> */}
          </div>
        </div>
      </div>

      {/* ── FINANCES ── */}
      <div style={{ minWidth: "300px" }}>
        <SectionLabel>Finances</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={C.orange}
            height={200}
            onClick={noop}
          >
            <Wallet height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h2>Trésorie</h2>
          </DashboardTile>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={C.orangeDark}
            height={160}
            onClick={noop}
          >
            <HandCoins height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Créances</h3>
          </DashboardTile>

          <DashboardTile
            color={C.white}
            backgroundColor={C.orange}
            height={160}
            onClick={noop}
          >
            <CreditCard height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Crédits</h3>
          </DashboardTile>
          <DashboardTile
            color={C.white}
            backgroundColor={C.orange}
            height={160}
            onClick={noop}
          >
            <Warehouse height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Inventaire</h3>
          </DashboardTile>
          <DashboardTile
            color={C.white}
            backgroundColor={C.charcoal}
            height={160}
            onClick={noop}
          >
            <FileBarChart height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Rapports</h3>
          </DashboardTile>
        </div>
        </div>
          
      </div>

      {/* ── CLIENTS ── */}
      <div style={{ maxWidth: "150px" }}>
        <SectionLabel>Clients</SectionLabel>
        <div style={{ display: "grid", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={C.emerald}
            height={160}
            onClick={noop}
          >
            <Users height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Afficher les clients</h3>
          </DashboardTile>
          <DashboardTile
            color={C.white}
            backgroundColor={C.emeraldDark}
            height={160}
            onClick={noop}
          >
            <UserPlus height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Créer un client</h3>
          </DashboardTile>
        </div>
      </div>

      {/* ── FOURNISSEURS ── */}
      <div style={{ maxWidth: "150px" }}>
        <SectionLabel>Fournisseurs</SectionLabel>
        <div style={{ display: "grid", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={C.teal}
            height={160}
            onClick={noop}
          >
            <Truck height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Afficher les Fournisseurs</h3>
          </DashboardTile>

          <DashboardTile
            color={C.white}
            backgroundColor={C.tealDark}
            height={160}
            onClick={noop}
          >
            <CirclePlus
              height={70}
              width={70}
              style={{ strokeWidth: "1.5px" }}
            />
            <h3>Créer un fournisseur</h3>
          </DashboardTile>
        </div>
      </div>

      {/* ── SETTINGS ── */}
      <div style={{ maxWidth: "300px" }}>
        <SectionLabel>Paramètres</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
          <DashboardTile
            color={C.white}
            backgroundColor={"#4B5563"}
            height={160}
            
            onClick={noop}
          >
            <Users height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Utilisateurs</h3>
          </DashboardTile>
         
          <DashboardTile
            color={C.white}
            backgroundColor={"#4B5563"}
            height={160}
            onClick={noop}
          >
            <Headset height={80} width={80} style={{ strokeWidth: "1.5px" }} />
            <h3>Support</h3>
          </DashboardTile>

          <DashboardTile
            color={C.white}
            backgroundColor={"#4B5563"}
            height={160}
            onClick={noop}
          >
            <History height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Journal d'activités</h3>
          </DashboardTile>
          <DashboardTile
            color={C.white}
            backgroundColor={"#4B5563"}
            height={160}
            onClick={noop}
          >
            <BellDot height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Notifications</h3>
          </DashboardTile>
          <DashboardTile
            color={C.white}
            backgroundColor={"#374151"}
            height={160}
            onClick={noop}
          >
            <SlidersHorizontal height={70} width={70} style={{ strokeWidth: "1.5px" }} />
            <h3>Paramètres avancés</h3>
          </DashboardTile>
       
        </div>
          
      </div>
    </div>
  );
}
