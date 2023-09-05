//import { IoTDTOAdapters } from "./IoTDTOAdapters"
import { SbcDtoAdapterType } from "../Types/SbcDtoAdapterType"

export namespace IoTDTOAdapters {
  export const Armbian:SbcDtoAdapterType = {
    GetallOverlayNameScript:"armbian_getalloverlays",
    PutOverlayNameScript:"armbian_putoverlay",
    DeleteOverlayNameScript:"armbian_deleteoverlay",
    EnableOverlayNameScript:"armbian_enableoverlay",
    DisableOverlayNameScript:"armbian_disableoverlay"
  };
}