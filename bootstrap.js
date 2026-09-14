$$('.nav-btn[data-route]').forEach(b=>b.onclick=()=>setRoute(b.dataset.route));
$('#settingsBtn').onclick=()=>setRoute('more');
$('#quickAdd').onclick=openQuickAdd;
window.navMonth=navMonth;window.state=state;
Object.assign(window,{renderSleepMood,renderPeriod,renderWaterSugar,openTracker,openMeals,renderMeals,setMealsView,openMealEditor,saveMealEntry,openPurchase,savePurchase,openSleepMood,saveSleepMood,openPeriod,savePeriod,openWaterSugar,saveWaterSugar,openLimits,openBudgets,exportData,importData,closeModal,chooseOne,openWellness,renderWellness,setWellnessView,openWellnessIntake,saveWellnessIntake,openWellnessHistoryEntry,saveWellnessHistory,deleteWellnessHistory});
render();
