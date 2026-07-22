<template>
    <v-list
        flat
        subheader
    >
        <v-subheader>Дополнительные домены Шикимори</v-subheader>

        <v-list-item-content class="px-4">
            <p class="text-caption mb-2" style="opacity:0.8">
                Домены shikimori.io, shikimori.one и shikimori.org поддерживаются всегда.
                Если сайт переедет на другой домен, добавьте его здесь — кнопка
                «Смотреть онлайн» появится и на нём.
            </p>

            <v-text-field
                v-model="newHost"
                :error-messages="error"
                dense
                hide-details="auto"
                label="Например: shikimori.example"
                outlined
                @keydown.enter="add"
            >
                <template v-slot:append-outer>
                    <v-btn :loading="loading" color="primary" small @click="add">Добавить</v-btn>
                </template>
            </v-text-field>
        </v-list-item-content>

        <v-list-item v-for="host in additionalHosts" :key="host">
            <v-list-item-content>
                <v-list-item-title>{{ host }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
                <v-btn icon @click="remove(host)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
    </v-list>
</template>


<script lang="ts">
    import {addShikimoriHost, getAdditionalShikimoriHosts, removeShikimoriHost} from '@/helpers/shikimori-hosts';
    import {Component, Vue} from 'vue-property-decorator';


    @Component({
        name: 'additional-hosts-option',
    })
    export default class AdditionalHostsOption extends Vue {
        public additionalHosts: string[] = [];
        public newHost = '';
        public error = '';
        public loading = false;

        public async created() {
            this.additionalHosts = await getAdditionalShikimoriHosts();
        }

        public async add() {
            if (!this.newHost || this.loading) {
                return;
            }

            this.error = '';
            this.loading = true;

            try {
                const result = await addShikimoriHost(this.newHost);
                if (result.success) {
                    this.newHost = '';
                    this.additionalHosts = await getAdditionalShikimoriHosts();
                } else {
                    this.error = result.error || 'Не удалось добавить домен';
                }
            } finally {
                this.loading = false;
            }
        }

        public async remove(host: string) {
            await removeShikimoriHost(host);
            this.additionalHosts = await getAdditionalShikimoriHosts();
        }
    }
</script>

<style scoped>
</style>
