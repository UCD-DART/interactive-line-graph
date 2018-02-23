import axios from "axios";
import { myMapStyles, mapOptions } from "../constants/mapStyles.js";
import { fakeGeoJson } from "../constants/fakeGeoJson.js";

function riskColor(city) {
  const color = city.risk > 1 ? "red" : "blue";
  return color;
}

function depthOf(object) {
  let level = 1;
  for (let key in object) {
    if (!object.hasOwnProperty(key)) continue;

    if (typeof object[key] == "object") {
      var depth = depthOf(object[key]) + 1;
      level = Math.max(depth, level);
    }
  }
  return level;
}

function _decodeCoordinates(coordinates) {
  if (typeof coordinates.point == "undefined") {
    if (coordinates.constructor == Array) {
      var container = [];
      for (let i in coordinates) {
        var g = _decodeCoordinates(coordinates[i]);
        container.push(g);
      }
      return container;
    }
  } else {
    var points = google.maps.geometry.encoding.decodePath(coordinates.point);
    var pointContainer = [];
    for (let point in points) {
      pointContainer.push([points[point].lng(), points[point].lat()]);
    }
    return pointContainer;
  }
}

function decodeGeometry(g) {
  if (depthOf(g.coordinates) == 3) {
    g.type = "Polygon";
  } else {
    g.type = "MultiPolygon";
  }
  g.coordinates = _decodeCoordinates(g.coordinates);
  return g;
}

export default function drawMap() {
  let map = new google.maps.Map(document.getElementById("map"), mapOptions);

  let fresnoPath =
    "qp_`FjvwyUPnUdVUKaUdcAE@bI`PCAeIt[Mfl@MdqAc@zG_AlNcIfDm@tWPbLBbFCJtBTrDtSjWdBsDv@Cb@h@f@B`@Hb@V?_Ad@??U~pAMZiw@l@cSe@yF?Ixl@Ap@_w@s@gg@rU_EeNyHUWhOIEeo@PuF}f@z@SuENaYM}WkRCnA_gAp@wE~Nga@dAaFpGkp@lr@CEpw@hb@?AtWp`@EFj_@mV?CnzA~k@eB@bVfWi@TrYxI?]`HxJjBt]wEMjG}F~CAfMfUk@Icd@Bi`@oQ@?qLpQ?F{}@_Ub@?wV~TADww@bIBNtXdY@rAtI|CmGjf@wAAsWxTAFlZdO_@HuHfFMD{c@tGiEnAqIdNyJ~FxS[r[zK?IvoBsa@I@uf@_AyH|@yEux@G?jOdFBJ`g@eF?vBj{@lLa@lFpWTd[}UBcKzCJpT{EwFcDt_@`DlEAvH~E?iBjCG`IhJChByB{B_EGcMX?@}GzFyAA|Xnl@NCiMvf@Fvb@SxAyZc@cBs[n@sGtAJanCzc@CAcMwAcMra@C@bTwA~EdYGEhgAuPrD?da@pPAEdR_H?|GbFGva@_@ju@~A~iArL_E|J|ClSQVbPcTJCxT{VGXrx@AzQjDf[FfHaEBo_@B@|VyKCD}VsUABuH}UA@tVrJ@BvHzId@Bh^iE?L|RuERD`_@xa@]Bsr@vAqMdEhC@dIz]DxDwBnTkTaO}E@mWjb@S`AsZ_NCDa[xOBHeOhDmg@xOABrw@rUAD|[l_@GfA~K|IaLxk@?[e[nM?Dqi@dJoLhFsGGpGGnJjLA@ddB_a@CIvEiICBnp@e@nw@ku@@M~ZcIIAp[cWAG`hAfHa@SjLjIIf@xZcS?@hYn@??fb@k@dG_J_@GcKia@AEye@mUp@}@{EeTY@mJql@?B`j@hl@KPleAJtq@`n@@fU`A@`BhTCFbp@mk@LJcOwm@PCu`@ol@MuU]cVCB`KaHSA|OLb[`HBrl@NFhu@ml@Lel@Y@rOiGK?bIjG@DjZ_UjABiKqVi@Kyi@_TG_D|p@fAtNfFA?tLwZRCeNwSQy@_H?oB`@aZG}W_@kEkV@AiKjVIBub@_WBcDCgBgJo@aAqKL?{AkEh@wAv@AnDeAA?fFgJA?tu@pl@GBnNaKEDlGaUCDqGuJ?uUEAeIsUpFCcK{[BCnOpEC_A`bAaKDt@gZqM@_EuH?m_@oKQ?rMiGr@QrY`HCN~YfUoA@`OmGHBjGnG@CsE|K@?bLj_@EDnZwT?j@`\\jS?jDCZfJ~NSDpl@aUAyJDDfYpJ@E{JjT?LhJtVMBxOcLBAdEdLJoFjKpFtCoK?HdGjLB?bIgm@GAiPhVIAeHgb@G@h[sSsAQ{ZnG@E{u@}S?sHBEvY~HEBn\\ol@HGiw@nM?Hk[cJEp@uZrBCKmOuGHA{GsEhHwLt@GdMsI?iCgY{H?A{\\uIESjw@pJGDzw@rQEzClMsAz`BcSFOqg@gv@}@qCrLnM@@|[gJ??bMjJfEJ`{ABj@wRAmAe@iWDSsoB}j@FFfw@tZE^pXs[I?h^o]FEtTlP?sCnE]`PkG?ErJ{a@z@?{QuO??yMgJ?GkQhI?BkEm`@?Vi]nCF|@wOmZf^}bArtAoP|\\aAi@aCZcDqAqAcAm@s@yAiAmCwCgB_B{CkEs@_BSkBD_AZmAJy@l@aHGiAAiBTsBdBeFb@}@~@yCn@_CxGkHZeI\\iFEuD[sCMg@CcAMm@g@{MMg@MsBm@{Dw@oDiAkBeA[WEsSoOsGsNC]W}BGoBOqBQoAi@qGa@oE_@iIHwAAk@UaBf@}BB{BVwBnAqGX_DQaEXcCyAeFMqB{@oAsA[gA?sALkGs@oKaJiD}C_DoAhLg]\\o@zAsEBYzDkLb[on@vLR\\oOpOiAoK_b@mJ_LsMiG_GfCtC_E`AwATs@z@oAX{ALeBE_Bc@mCq@kBaByCcFwH_Aw@uFuBe@GaMwHiFxDiGwD{@eDc@uAa@{BEQe@aHj[hACwI~]~Tt@fFhAuPp@gs@bEaWkNcFhCkJLMXm@b@_B`@eC~CgLn@qAfBgC^_A^oA^_DZeBPyABuASyFKcAl@aLwGaSiA}F{@eDmAOcAReJmE{^_Ca]mLgGoIoBiJgByDIsA}@eEYcAGy@qBiBuAYe@cAao@s[oEwE_DwUNuUUWOw@m@aAm@uAg@s@eCuBeB{@qCeDkc@eFaB|@_@CaA\\yCpBiA`AcTlLeCNUQ_AUmANcBv@eAFjAsEkHoAdVoEjJaO?y_@qM{E}JgTsGgY_D{B_@uMeD}Dw\\}ScFaJmXit@aS}RyE}JsHgYnE?c@gxA~VtRdInBtD[rSeLz\\UjzACjzAS";
  let bakersFieldPath =
    "mfdvExzbuU_a@ABva@lQtSos@A?iv@yUC?uZ{yAKExZ\\rnB@|L|a@wL@beByW~FjH~FxAyEBloBtU??Sba@c@AqYhJA^xG~A?MtJ~E~DdK~@AhAj@B?nAw@t\\qUaF}F|EsM?Ejo@uD?AvL_PJAlKjf@J|DmD@sDtD_DB{RtCsQtI@Phv@jl@B@tZkbAEKjeA}F?AbBsM?AlH|M?AjHtFpFAvIsU?AzLvk@?Voh@dUBEhv@rl@@AvLyU@A`^yUkGAvQrl@BQhv@{bAE?qa@gUqCGpoAlU@?lMmU?Efw@wyACAfu@tyAEKvrBHtmBotDa@TzjIqnC[bEzGjaAhqBbNbhDtJlL~Bh\\T?pH`LrAjPoD|Wn@rE_NlQA{aA_DsLaPABoa@uUA?wSsUC@qv@wUEI_TgJAUkhAea@EG{Q_ME@sZo^KHymBsl@KLmv@aVDBuZqP?cD`nBcl@NEanB_DsZyPAEaMqUsLCov@tJA@kv@nI[?{KhUwAZg]kL?hCmGspA?`@hr@nT`C?tZaPBEtZdPC?xZqU?CtZERal@HAe\\bf@OKmXnEc@@}EkJ?AyKnI?Bwb@gbA?@gIwL?AoI}G@?tSoUACso@nG|EbM@?b@vI?dAiLfv@s@@mg@}B?xBeMD?YuZyTBDkv@~^DOeMjL_BKaJkIFxIcCBab@yIAbBqPwJCBwZoLAA{K{J[Czg@iGC@yTkMAB_`@wNAmF~BEn`AsC??nBcG@?fDvK@Aj`@kU??w[aMHm@aTmFJ@|Swl@BTxrAVUdb@XE`RnJqOo@tLnO|DmHdJpDfCmMpP{GCgb@@ElGeA`HfAlc@iIh@GqLsa@CArLyAfY_F|K{Wf\\dKnMyUzZEx|Ekl@CCdsA_m@YElZmyAKDunB|TwY{TCNwxFpa@AvEgAxf@yo@vHwByyAn@@}YvY??eIjO?xCoR?eRxF?\\qSgUgGaEj@gJrE@vf@eP?JyeDhk@FHmv@}i@JV_w@vAmSMaIh{@ynAnX?EtmBIlv@uUCKlv@mDROlv@~[BKaw@xw@ABuZiJHNorAlv@AJ}f@lG??qNbC?Env@tU?JkmBw`@JCbZwIW@_Z]?@kMxHCt@oZnJCLcx@cQPAkU}C\\?OjCa@nJ`AnHpD`Ks@vFfCNsh@vq@fv@lOhJ?fIbJzRfKhNAdKi[AA|SaPADso@yVGA`w@rVIGzv@v]?@~LaG?Qzh@lVC@}L`NhGr\\}A@ePyBS{CbDg@gEbGC_BG?wBqF??gBjK?@kJpJ?pJrIAxQlNoNts@GDkdA_BwGqREBkZct@[B{ZnF?ByXcUC@_]lZFPmZw\\Q@}JkN?BoXhF_DcMmByrAtA}P~CqCzEgMbG{Aw@dQcVrCmUdDmChJcMrFaLlHeLdBeCcB}AoFwNoD{RiKoFgLi[Yi@k@{AeAwBgFwLuQwQaDoDYuACaC^kBtA_ChAmAA}@f@a@e@{AkEoLaGaG{Fci@i@kXcFgX|DuL\\eGwFgQ{G}_@kI{Jwq@NiQyc@Vqd@nNqn@lGAgAbQwBvd@kDxQJrAnDvErPxPteA_@cE}QcM}^aC_UqF{SoG_J{[}x@f@_@}JuSsO}d@eBiT}EwIaHaFaFuAyOoCaJq@oCG{L`@ic@vVcGZmEaAaCuAiC{CuAaD{@aFGsCp@gHvKi]bIPKcSxNAe@{uB~\\eDpHeFjC{DbSeu@jBaR_A[_Cm`@xAoFyDmY}RwR^iMpFiLAsKzCsLzBwV_Ays@tFgBvV}WdFaWlAc{A}_BQGcVEsz@tf@k@vK{ZsGeIgGaFaFyKkH_XkDyd@iBcKyH}LDePjl@Q`@kmB~k@c@w@z{EjtDU|@~gBzyAvDFpnBoyAe@Ftc@ag@F_CfIWl~@tUAJrZoX@sGiZqJCBhh@tUf@rEnKxe@LE{v@byAAZ~mB`zAG?`rArUB@xLwUC@zLczA@DtHDrl@nYI|F`Kka@dA@zLjJ?@bMpG@GbMbB?FvZpU@Hvd@sZ_@qPl@Lzk@pU^Nlk@gD@sGeEmFSk@hDgSyJ@{Q_BeLyy@Pn@brApSREvL|EdJtAx@~AtZxA?XtZvOSh@Q|BfDLtSgJzABhJdJlAHzLrUCzKB}Hph@{B{LuMm@kB|EuBi@@sLwUiCAyLuD@G{LqD@FrZyI?jJph@m^?Et]|DdN{G@?fHml@^?tZsWNnC~L~FtNrL`Xdk@]lKAxGjBxAaBnG_Gy@wRn@HvLbNAgIQEAcOeB?AcJlA??uBTFTcJHwQjE?vE_@hAuHbF`ElGbBdLh@?qe@}Bk@vBwN`XRh@sDdBb@`OnCjDiFzJnFfAmFtInFxMB@xJvUdGAcEjJ?@dJ~FfCdBg\\xUAIsZtU?CoVmBeCgR?Imv@aH?BePxGoIxK@IuZ_WCC{SiJAEsa@rU@HpZnUBBxYjE?nEst@hrAWCyZ_E?@sv@jC@C}SkC_Ebl@BRpu@l@t\\je@BD|XtD?Dvv@voG?F~pAzyAHCkqAxyAF@xmB";

  let decodedFresno = google.maps.geometry.encoding.decodePath(fresnoPath);

  const setPath = new google.maps.Polyline({
    path: decodedFresno,
    strokeColor: "red",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map
  });

  // axios.get("https://mathew.calsurv.org/zika/layer").then(function(res) {
  //   cachedData = res.data;
  //   cachedData.features.forEach( f => {
  //     // f.geometry = decodeGeometry(f.geometry);
  //     // console.log(f.geometry);
  //   });
  //   map.data.addGeoJson(cachedData)
  // });

  //fetch a data file of my proposed api, except just for one city, no dates or anything
  // take that data, decode the geometry
  // map.data.addGeoJson(data)
  // map.data.setStyle(return appropriate color)
  //
}

drawMap();
