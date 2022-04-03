import { setGlobalFlags } from "./src";

setGlobalFlags({
	account: "team-b5testbusiness.b5test.com",
});

// console.log("account.forget", account.forget("team_b5testbusiness"));
// console.log("account.get", account.get());
// console.log("account.list", account.list());
// console.log(
// 	"document.create",
// 	document.create("jest.config.js", {
// 		fileName: "foo",
// 		title: "Some file",
// 	}),
// );
// console.log(
// 	"document.edit",
// 	document.edit("jhedvj6iotzdl6f7hohypij6w4", "tsconfig.json", {
// 		title: "foo",
// 	}),
// );
// console.log(
// 	"document.get",
// 	document.get("zv6hjmcyu6zru7gddrw3kmm3eu", { output: "json" }),
// );
// console.log("document.list", document.list());
// console.log("document.delete", document.delete("jhedvj6iotzdl6f7hohypij6w4"));
// console.log(
// 	"eventsApi.create",
// 	eventsApi.create("ExampleToken", {
// 		features: ["signinattempts", "itemusages"],
// 		expiresIn: "10m",
// 	}),
// );
// console.log(connect.server.create("TestServer"));
// console.log(connect.server.edit("test", { name: "John Deer" }));
// console.log(connect.server.list());
// console.log(connect.server.get("TestServer2"));
// console.log(connect.server.delete("3RKWOXHJ4VEY3HNCLCE5DBJ2TI"));
// connect.server.list().forEach((server) => {
// 	connect.server.delete(server.id);
// });
// console.log(connect.token.create("TestToken", { server: "TestServer" }));
// console.log(
// 	connect.token.edit("mh25r3ai3rg4lhjiacu4dj7kla", { name: "TestToken2" }),
// );
// console.log(connect.token.list());
// console.log(connect.token.delete("humqrxro2wwujfezm3vbyr7cze"));
// console.log(
// 	connect.vault.grant({
// 		vault: "z7nadigoatb62t3jv5hnfi4eca",
// 		server: "KT24HD76LRATLJKMYQHN62TOIQ",
// 	}),
// );
// console.log(
// 	connect.vault.revoke({
// 		vault: "z7nadigoatb62t3jv5hnfi4eca",
// 		server: "KT24HD76LRATLJKMYQHN62TOIQ",
// 	}),
// );
// console.log(group.list());
// console.log(group.create("TestGroup"));
// console.log(group.edit("TestGroup", { description: "sdfdfa" }));
// console.log(group.delete("porcdlpmhopw4jg7vyuxcrmely"));
// console.log(group.get("lhop4yauaboetvz5qhmtdou7qq"));
// console.log(
// 	group.user.grant({
// 		group: "lhop4yauaboetvz5qhmtdou7qq",
// 		user: "SS3XWNH7DFEVLHEJQ2BRMQUIIQ",
// 		role: "member",
// 	}),
// );
// console.log(group.user.list("lhop4yauaboetvz5qhmtdou7qq"));
// console.log(
// 	group.user.revoke({
// 		group: "lhop4yauaboetvz5qhmtdou7qq",
// 		user: "SS3XWNH7DFEVLHEJQ2BRMQUIIQ",
// 	}),
// );
// console.log(group.user.list("lhop4yauaboetvz5qhmtdou7qq"));
// console.log(
// 	connect.group.grant({
// 		group: "lhop4yauaboetvz5qhmtdou7qq",
// 		server: "WRO7NFYED5DJVITHOPIACEMQXY",
// 	}),
// );
// console.log(
// 	connect.group.revoke({
// 		group: "lhop4yauaboetvz5qhmtdou7qq",
// 		server: "WRO7NFYED5DJVITHOPIACEMQXY",
// 	}),
// );
// console.log(connect.group.revoke({ group: "test", allServers: true }));
// console.log(read.parse("op://Private/Login/username"));
// console.log(
// 	read.toFile("op://Private/Login/username", "./foo", { noNewline: false }),
// );
// console.log(item.list());
// console.log(item.get("xtoszeq662e2ys2ia3l2mgcwly").urls);
// console.log(
// 	item.share("xtoszeq662e2ys2ia3l2mgcwly", {
// 		viewOnce: true,
// 	}),
// );
// console.log(item.template.list());
// console.log(item.template.get("Outdoor License"));
// console.log(vault.list());
// console.log(vault.get("cwlb4pjwkkl2ouule3kh6uqsfq"));
// console.log(vault.create("TestVault"));
// console.log(
// 	vault.edit("cwlb4pjwkkl2ouule3kh6uqsfq", {
// 		icon: "circle-of-dots",
// 		travelMode: "off",
// 	}),
// );
// console.log(vault.delete("6z3tn7q5nhurclycasdvkruhxe"));
// console.log(vault.group.list("ns3qgjm6vlhxb4nfhy6yi4wbz4"));
// console.log(
// 	vault.group.grant({
// 		group: "lhop4yauaboetvz5qhmtdou7qq",
// 		permissions: ["copy_and_share_items"],
// 		vault: "ns3qgjm6vlhxb4nfhy6yi4wbz4",
// 	}),
// );
// console.log(
// 	vault.group.revoke({
// 		group: "lhop4yauaboetvz5qhmtdou7qq",
// 		permissions: ["copy_and_share_items"],
// 		vault: "ns3qgjm6vlhxb4nfhy6yi4wbz4",
// 	}),
// );
// console.log(vault.user.list("ns3qgjm6vlhxb4nfhy6yi4wbz4"));
// console.log(
// 	vault.user.grant({
// 		user: "SS3XWNH7DFEVLHEJQ2BRMQUIIQ",
// 		permissions: ["copy_and_share_items"],
// 		vault: "ns3qgjm6vlhxb4nfhy6yi4wbz4",
// 	}),
// );
// console.log(
// 	vault.user.revoke({
// 		user: "SS3XWNH7DFEVLHEJQ2BRMQUIIQ",
// 		permissions: ["copy_and_share_items"],
// 		vault: "ns3qgjm6vlhxb4nfhy6yi4wbz4",
// 	}),
// );
// console.log(user.list());
// console.log(
// 	user.invite({
// 		email: "jody.heavener+testinvite@agilebits.com",
// 		name: "Test Invite",
// 	}),
// );
// console.log(user.delete("US7XLVE2MJAIRA4BULFLPURBSE"));
// console.log(user.get("US7XLVE2MJAIRA4BULFLPURBSE"));
// console.log(user.edit("US7XLVE2MJAIRA4BULFLPURBSE", { name: "Test Use!!!r" }));
// console.log(user.confirm("US7XLVE2MJAIRA4BULFLPURBSE"));
// console.log(user.suspend("US7XLVE2MJAIRA4BULFLPURBSE"));
// console.log(user.reactivate("US7XLVE2MJAIRA4BULFLPURBSE"));
// console.log(
// 	item.get("xtoszeq662e2ys2ia3l2mgcwly", {
// 		fields: { label: ["username", "password"] },
// 	}),
// );
// console.log(
// 	item.get("xtoszeq662e2ys2ia3l2mgcwly", {
// 		fields: { type: ["concealed", "email"] },
// 	}),
// );
