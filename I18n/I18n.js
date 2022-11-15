const messages={
    en:{
        massages:{
            hello:'hello wold'
        }
    },
    zh:{
        massages:{
            hello:'你好世界'
        }
    }
}

const i18n = new VueI18n({
    locale:'en'
    messages,
})
new Vue({ i18n }).$mount('#app')