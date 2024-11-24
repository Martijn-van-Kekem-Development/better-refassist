export class API {
    /**
     * Get the official ID.
     */
    public static getSeasonData() {
        const data = localStorage.getItem("season_data") ?? null;
        if (!data) {
            document.body.setAttribute("data-season-saved", "false");
            return null;
        }

        return JSON.parse(data);
    }

    /**
     * Get the assignments for the user.
     * @param pastMatches
     */
    public static async getAssignments(pastMatches: boolean): Promise<Assignment[]> {
        const seasonData = this.getSeasonData();
        if (!seasonData) return [];

        const past = pastMatches ? "true" : "false";
        const data = await fetch("https://home.refassist.com/RefereeApp/GetAssignments", {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "pragma": "no-cache",
            },
            "body": `input%5BOfficialId%5D=${
                seasonData.official}&input%5BSeasonId%5D=${
                seasonData.season}&input%5BPast%5D=${
                past}&input%5BDocumentsOnly%5D=false`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        return await data.json();
    }

    /**
     * Get the expenses for the user.
     */
    public static async getExpenses(): Promise<Expense[]> {
        const seasonData = this.getSeasonData();
        if (!seasonData) return [];

        const data = await fetch("https://home.refassist.com/ExpensesForOfficials/ExpensesRead", {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "pragma": "no-cache",
            },
            "body": `sort=&group=&filter=&seasonId=${seasonData.season}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        return (await data.json()).Data;
    }

    /**
     * Get the available forms from the API.
     * @param matchID
     */
    public static async getAvailableForms(matchID: string): Promise<Form[]> {
        const element = document.createElement("div");

        const data = await fetch(`https://home.refassist.com/ViewComponents/FilledFormsViewComponent?matchId=${matchID}`);
        element.innerHTML = await data.text();

        let forms: Form[] = [];
        for (let link of element.querySelectorAll(".download-filledform[data-id]")) {
            forms.push({
                name: link.textContent.trim(),
                id: link.getAttribute("data-id")
            });
        }

        return forms;
    }

    /**
     * Get the form URL.
     * @param id The form ID.
     */
    public static async getFormURL(id: string): Promise<string> {
        const data = await fetch(`https://home.refassist.com/Global/DownloadFilledForm?filledFormId=${id}`);
        return await data.json();
    }
}

export interface Assignment {
    "Id": number,
    "DocumentId": number,
    "StartDate": string,
    "MatchId": number,
    "HomeTeam": string,
    "AwayTeam": string,
    "Serie": string,
    "Division": string,
    "Venue": string,
    "Address": string[],
    "Competition": string,
    "RefereeType": string,
    "RefereeTypeNr": number,
    "SportDisciplineId": number,
    "AssignmentLevelDetailId": number,
    "Score": string,
    "Quotation": number,
    "CancellationPossible": boolean,
    "HasFilledForms": boolean,
    "TransportDistance": number,
}

export interface Expense {
    Amount: number,
    Approvable: boolean,
    CostLineType: string,
    Date: string,
    DatePaid: string,
    Explanation: string,
    Manageable: boolean
    Id: number,
    Status: number
}

export interface Form {
    id: string,
    name: string
}