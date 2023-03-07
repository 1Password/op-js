import OPJS from "../src";

export const createOpjs = () =>
	new OPJS({
		globalFlags: {
			account: process.env.OP_ACCOUNT,
		},
	});

export const MALICIOUS_STRING =
	'; & | ` \' " malicious_command; echo $USER; rm -r . # $ % ^ * ( ) " - _ = + [ ] { } < > / ? : ; , . ! @ ~';
