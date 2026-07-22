declare namespace myanimelist {

    interface Episode {
        mal_id: number;
        url: string;
        title: string;
        title_japanese: string;
        title_romanji: string;
        aired: string;
        score: number;
        filler: boolean;
        recap: boolean;
        forum_url: string;
    }

    namespace api {
        interface EpisodeCollection {
            pagination: {
                last_visible_page: number;
                has_next_page: boolean;
            };
            data: Episode[];
        }
    }

}
