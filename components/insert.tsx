"use server"

import { createClient } from "@/lib/supabase/server";

const insertData = async () => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("genres")
		.insert({ name: "New Genre" })
		.select("*")
		.single();

	if (error) {
		console.error("Errore durante l'inserimento del genere:", error);
		return { error: error.message };
	} else {
		console.log("Genere inserito con successo:", data);
		return
	}
};

export default insertData;