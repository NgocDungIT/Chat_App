export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = 'api/auth';
export const USER_ROUTES = 'api/users';
export const CONTACTS_ROUTES = 'api/contacts';
export const MESSAGES_ROUTES = 'api/messages';
export const CHANNEL_ROUTES = 'api/channel';

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;
export const UPDATE_USER = `${USER_ROUTES}/update-profile`;
export const UPLOAD_IMAGE = `${USER_ROUTES}/upload-image`;
export const DELETE_IMAGE = `${USER_ROUTES}/delete-image`;
export const GET_USER = `${USER_ROUTES}/user-info`;

export const SEARCH_CONTACTS = `${CONTACTS_ROUTES}/search`;
export const GET_DM_CONTACTS = `${CONTACTS_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS = `${CONTACTS_ROUTES}/get-all-contacts`;

export const CREATE_CHANNEL = `${CHANNEL_ROUTES}/create`;
export const GET_USER_CHANNELS = `${CHANNEL_ROUTES}/get-user-channels`;

export const GET_ALL_MESSAGES = `${MESSAGES_ROUTES}/get-messages-by-user`;
export const UPLOAD_FILE = `${MESSAGES_ROUTES}/upload-file`;
