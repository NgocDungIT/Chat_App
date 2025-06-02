export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = 'api/auth';
export const USER_ROUTES = 'api/users';
export const CONTACTS_ROUTES = 'api/contacts';
export const MESSAGES_ROUTES = 'api/messages';
export const CHANNEL_ROUTES = 'api/channel';
export const CHAT_BOT_ROUTES = 'api/chat-bot';

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const VERIFY_OTP = `${AUTH_ROUTES}/verify-otp`;
export const VERIFY_EMAIL = `${AUTH_ROUTES}/verify-email`;
export const SEND_OTP = `${AUTH_ROUTES}/send-otp`;
export const CHANGE_PASSWORD = `${AUTH_ROUTES}/change-password`;
export const LOGIN_GOOGLE_ROUTE = `${AUTH_ROUTES}/login-google`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;
export const UPDATE_USER = `${USER_ROUTES}/update-profile`;
export const UPLOAD_IMAGE = `${USER_ROUTES}/upload-image`;
export const DELETE_IMAGE = `${USER_ROUTES}/delete-image`;
export const GET_USER = `${USER_ROUTES}/user-info`;
export const GET_STREAM_TOKEN = `${USER_ROUTES}/get-stream-token`;

export const SEARCH_CONTACTS = `${CONTACTS_ROUTES}/search`;
export const GET_DM_CONTACTS = `${CONTACTS_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS = `${CONTACTS_ROUTES}/get-all-contacts`;

export const CREATE_CHANNEL = `${CHANNEL_ROUTES}/create`;
export const GET_USER_CHANNELS = `${CHANNEL_ROUTES}/get-user-channels`;
export const ADD_MEMBERS_CHANNEL = `${CHANNEL_ROUTES}/add-members-channel`;
export const LEAVE_CHANNEL = `${CHANNEL_ROUTES}/leave-channel`;
export const GET_CHANNEL_MESSAGES = `${CHANNEL_ROUTES}/get-messages-channel`;
export const UPLOAD_IMAGE_CHANNEL = `${CHANNEL_ROUTES}/upload-image`;
export const DELETE_IMAGE_CHANNEL = `${CHANNEL_ROUTES}/delete-image`;

export const CREATE_SESSION_CHAT_BOT = `${CHAT_BOT_ROUTES}/create-session`;
export const ADD_MESSAGE_SESSION = `${CHAT_BOT_ROUTES}/add-message-session`;
export const GET_ALL_SESSIONS = `${CHAT_BOT_ROUTES}/all-sessions`;
export const DELETE_SESSION = `${CHAT_BOT_ROUTES}/delete-session`;

export const GET_ALL_MESSAGES = `${MESSAGES_ROUTES}/get-messages-by-user`;
export const UPLOAD_FILE = `${MESSAGES_ROUTES}/upload-file`;
