import { PermissionsAndroid, Alert, Platform } from 'react-native';
import Contacts from 'react-native-contacts';

/**
 * Request READ & WRITE CONTACTS Permission
 */
export const requestContactsPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
      const writeGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS);

      if (readGranted && writeGranted) {
        console.log("Contacts Permission Already Granted ✅");
        return true;
      }

      // Request permissions if not granted
      const newReadGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts Access Required",
          message: "This app needs access to your contacts.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Deny",
          buttonPositive: "Allow",
        }
      );

      const newWriteGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
        {
          title: "Contacts Write Access Required",
          message: "This app needs write access to add contacts.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Deny",
          buttonPositive: "Allow",
        }
      );

      if (newReadGranted === PermissionsAndroid.RESULTS.GRANTED && newWriteGranted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Contacts Permission Granted ✅");
        return true;
      } else {
        console.log("Contacts Permission Denied ❌");
        return false;
      }
    } catch (err) {
      console.warn("Error requesting permission:", err);
      return false;
    }
  }
  return true;
};

export const fetchContacts = async () => {
  try {
    const contacts = await Contacts.getAll();
    console.log("Fetched Contacts:", contacts);
    Alert.alert("Contacts Fetched", `Total Contacts: ${contacts.length}`);
    return contacts;
  } catch (error) {
    console.warn("Error fetching contacts:", error);
    return [];
  }
};

export const addNewContact = async (
  name: string,
  phoneNumber: string,
  alternatePhone?: string,
  email?: string,
  company?: string,
  jobTitle?: string,
  address?: string,
  city?: string,
  state?: string,
  pincode?: string,
  country?: string,
  dob?: string,
  website?: string,
  note?: string
) => {
  try {
    // Check if the contact already exists
    // const existingContacts = await Contacts.getAll();
    // const isDuplicate = existingContacts.some(contact =>
    //   contact.phoneNumbers?.some(phone => phone.number === phoneNumber)
    // );

    // if (isDuplicate) {
    //   return {
    //     status: "error",
    //     data: "Contact already exists in the phone.",
    //   };
    // }

    // Creating new contact
    const newContact: Partial<any> = {
      givenName: name,
      phoneNumbers: [{ label: "mobile", number: phoneNumber }],
      ...(alternatePhone && { phoneNumbers: [{ label: "work", number: alternatePhone }] }),
      ...(email && { emailAddresses: [{ label: "work", email }] }),
      ...(company && { company }),
      ...(jobTitle && { jobTitle }),
      ...(address && {
        postalAddresses: [
          {
            label: "home",
            formattedAddress: address,
            street: address,
            city,
            state,
            postCode: pincode,
            country,
          },
        ],
      }),
      ...(dob && { birthday: { day: parseInt(dob.split("-")[0]), month: parseInt(dob.split("-")[1]), year: parseInt(dob.split("-")[2]) } }),
      ...(website && { urlAddresses: [{ label: "website", url: website }] }),
      ...(note && { note }),
    };

    const savedContact = await Contacts.addContact(newContact);
    return {
      status: "success",
      data: savedContact,
    };
  } catch (error: any) {
    return {
      status: "error",
      data: error?.message || "Failed to save contact.",
    };
  }
};





