import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import CreateRoomModal from "./CreateRoomModal";
import LobbyTable from "./LobbyTable";
import useDataApi from "../../hooks/useDataApi";
import useProfile from "../../hooks/useProfile";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Announcements } from "./Announcements";
import { PluginsTable } from "./PluginsTable";
import { PatreonModal } from "../support/PatreonModal";
import { LobbyButton } from "../../components/basic/LobbyButton";
import { TermsOfServiceModal } from "./TermsOfServiceModal";
import { PluginLobby } from "./PluginLobby";
import { Footer } from "./Footer";
import LobbyContainer from "./LobbyContainer";

export const Lobby = () => {
  const isLoggedIn = useIsLoggedIn();
  const [showModal, setShowModal] = useState(null);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [replayId, setReplayId] = useState("");
  const [ringsDbInfo, setRingsDbInfo] = useState([null,null,null,null]);
  const [loadShuffle, setLoadShuffle] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const apiPlugins = useDataApi(
    "/be/api/plugins",
    null
  );
  console.log("Rendering Lobby", ringsDbInfo)
  useEffect(() => {
    const url = window.location.href;
    if (url.includes("newroom")) {
      if (url.includes("ringsdb") || url.includes("test")) {
        var splitUrl = url.split( '/' );
        const newroomIndex = splitUrl.findIndex((e) => e === "newroom")
        const ringsDbDomain = splitUrl[newroomIndex + 1]
        const newRingsDbInfo = [null, null, null, null];
        var deckIndex = 0;
        for (var i = newroomIndex + 2; i<splitUrl.length-1; i += 2 ) {
          const ringsDbType = splitUrl[i];
          const ringsDbId = splitUrl[i+1];
          newRingsDbInfo[deckIndex] = {id: ringsDbId, type: ringsDbType, domain: ringsDbDomain};
          deckIndex = deckIndex + 1;
        }
        setRingsDbInfo(newRingsDbInfo);
      }
      if (url.includes("replay")) {
        var splitUrl = url.split( '/' );
        const newroomIndex = splitUrl.findIndex((e) => e === "newroom")
        setReplayId(splitUrl[newroomIndex + 2]);
      }
      setShowModal("createRoom");
    }
  }, []);

  const plugins = apiPlugins?.data?.data ? apiPlugins.data.data : null;
  console.log("pluginslist",plugins);

  return (
      <LobbyContainer>
        <PluginsTable plugins={plugins} setSelectedPlugin={setSelectedPlugin}/>
      </LobbyContainer>
  );
};
export default Lobby;
