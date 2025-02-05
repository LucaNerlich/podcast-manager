export default {
    async beforeCreate(event) {
        event.params.data.guid = event.params.data.guid ?? crypto.randomUUID();
    },
};
