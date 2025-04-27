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

/**
 * Fetch all contacts
 */
export const fetchContacts = async () => {
  try {
    const contacts = await Contacts.getAll();
    console.log("Fetched Contacts:", contacts.length);
    return contacts;
  } catch (error) {
    console.warn("Error fetching contacts:", error);
    return [];
  }
};

/**
 * Add New Contact (with duplicate check and override support)
 */
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
): Promise<{ status: "success" | "error" | "cancelled", data: any }> => {
  try {
    const existingContacts = await fetchContacts();

    const existingContact = existingContacts.find(contact =>
      contact.phoneNumbers?.some(phone => phone.number.replace(/\s+/g, '') === phoneNumber.replace(/\s+/g, ''))
    );

    if (existingContact) {
      // If contact exists, ask if the user wants to update
      return new Promise((resolve) => {
        Alert.alert(
          "Contact Already Exists",
          "This contact already exists. Do you want to update it?",
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => resolve({ status: "cancelled", data: "User choose not to override contact." }),
            },
            {
              text: "Yes",
              onPress: async () => {
                try {
                  const updatedContact : any = {
                    ...existingContact,
                    givenName: name, // Always update name
                    phoneNumbers: [
                      { label: "mobile", number: phoneNumber },
                      ...(alternatePhone ? [{ label: "work", number: alternatePhone }] : []),
                    ],
                    emailAddresses: email ? [{ label: "work", email }] : existingContact.emailAddresses,
                    company: company || existingContact.company,
                    jobTitle: jobTitle || existingContact.jobTitle,
                    postalAddresses: address ? [{
                      label: "home",
                      formattedAddress: address,
                      street: address,
                      city: city ?? existingContact?.postalAddresses?.[0]?.city,
                      state: state ?? existingContact?.postalAddresses?.[0]?.state,
                      postCode: pincode ?? existingContact?.postalAddresses?.[0]?.postCode,
                      country: country ?? existingContact?.postalAddresses?.[0]?.country,
                    }] : existingContact?.postalAddresses,
                    birthday: dob ? {
                      day: parseInt(dob.split("-")[0]),
                      month: parseInt(dob.split("-")[1]),
                      year: parseInt(dob.split("-")[2]),
                    } : existingContact.birthday,
                    urlAddresses: website ? [{ label: "website", url: website }] : existingContact.urlAddresses,
                    note: note || existingContact.note,
                  };

                  await Contacts.updateContact(updatedContact);

                  resolve({
                    status: "success",
                    data: "Contact updated successfully.",
                  });
                } catch (updateError: any) {
                  console.error("Error updating contact:", updateError);
                  resolve({
                    status: "error",
                    data: updateError?.message || "Failed to update contact.",
                  });
                }
              },
            },
          ],
          { cancelable: false }
        );
      });
    } else {
      // If contact does not exist, create a new one
      const newContact: Partial<any> = {
        givenName: name,
        phoneNumbers: [
          { label: "mobile", number: phoneNumber },
          ...(alternatePhone ? [{ label: "work", number: alternatePhone }] : []),
        ],
        ...(email && { emailAddresses: [{ label: "work", email }] }),
        ...(company && { company }),
        ...(jobTitle && { jobTitle }),
        ...(address && {
          postalAddresses: [
            {
              label: "home",
              formattedAddress: address,
              street: address,
              city: city ?? '',
              state: state ?? '',
              postCode: pincode ?? '',
              country: country ?? '',
            },
          ],
        }),
        ...(dob && {
          birthday: {
            day: parseInt(dob.split("-")[0]),
            month: parseInt(dob.split("-")[1]),
            year: parseInt(dob.split("-")[2]),
          },
        }),
        ...(website && { urlAddresses: [{ label: "website", url: website }] }),
        ...(note && { note }),
      };

      await Contacts.addContact(newContact);

      return {
        status: "success",
        data: "Contact added successfully.",
      };
    }
  } catch (error: any) {
    console.error("Error adding new contact:", error);
    return {
      status: "error",
      data: error?.message || "Failed to add contact.",
    };
  }
};

