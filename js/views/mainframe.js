var templates = require('./templates');

module.exports = Backbone.View.extend({
        
    PCA: templates.PCA,
    
    renderPCA: function(){
        this.$el.append(this.PCA());
        return this;
    }
    
});
