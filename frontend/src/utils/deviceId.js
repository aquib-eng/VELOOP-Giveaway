const DEVICE_STORAGE_KEY =
  "veloopp_device_id";

const generateRandomId = () => {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2)
  );
};

export const getDeviceId = () => {
  try {
    let deviceId =
      localStorage.getItem(
        DEVICE_STORAGE_KEY
      );

    if (!deviceId) {
      deviceId =
        generateRandomId();

      localStorage.setItem(
        DEVICE_STORAGE_KEY,
        deviceId
      );
    }

    return deviceId;
  } catch (error) {
    console.error(
      "Device ID error:",
      error
    );

    return "";
  }
};