import { setGlobalFlags } from "./src";

setGlobalFlags({
	account: "my.b5test.com",
});

// console.log("account.add", account.add());
// console.log("account.forget", account.forget("test"));
// console.log("account.get", account.get());
// console.log("account.list", account.list());
// console.log("document.create", document.create());
// console.log("document.edit", document.edit());
// console.log("document.get", document.get("7h35xo6am6tknu5rc7xq4hxkoy"));
// console.log("document.list", document.list());
// console.log("document.delete", document.delete("nh6xg4adbc3rru3ouuuhnc4764"));
// console.log(
// 	"eventsApi.create",
// 	eventsApi.create("ExampleToken", {
// 		features: ["signinattempts"],
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
// console.log(connect.token.create("TestToken", { server: "TestServer2" }));
// console.log(
// 	connect.token.edit("mmkhrcgmhxrev2aycvhx5awama", { name: "TestToken2" }),
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
// console.log(
// 	connect.group.grant({ group: "test", server: "KT24HD76LRATLJKMYQHN62TOIQ" }),
// );
// console.log(connect.group.revoke({ group: "test", allServers: true }));
// console.log(read("op://Work/Foo Value/username"));
