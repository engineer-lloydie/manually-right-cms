import { defineStore } from 'pinia'

export const useModalStore = defineStore("modal", {
    state: () => {
        return {
            isActiveModal: false
        };
    },
    getters: {
        modalActive: (state) => {
            return state.isActiveModal
        }
    },
    actions: {
        showModal(modalToShow) {
            this.isActiveModal = true;
        },
    }
});