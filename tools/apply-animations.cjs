const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function patchFile(relPath, transforms) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`[NOT FOUND] ${relPath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const { from, to } of transforms) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      count++;
    } else {
      console.log(`[MISS in ${relPath}]:`, from.slice(0, 50).trim());
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[OK] ${relPath} (${count}/${transforms.length} patches applied)`);
}

console.log('--- Applying Smooth Animations Across All Views ---');

// 1. BerandaTransparansi.astro
patchFile('src/components/public/BerandaTransparansi.astro', [
  {
    from: '<section class="max-w-[1400px] mx-auto px-6 pt-12 pb-16">',
    to: '<section class="max-w-[1400px] mx-auto px-6 pt-12 pb-16 reveal-on-scroll">'
  },
  {
    from: '<div class="lg:col-span-7 space-y-6">',
    to: '<div class="lg:col-span-7 space-y-6 reveal-left">'
  },
  {
    from: '<div class="lg:col-span-5">',
    to: '<div class="lg:col-span-5 reveal-right">'
  },
  {
    from: '<div class="relative rounded-[36px] overflow-hidden border border-mist-s6 bg-paper-s6 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">',
    to: '<div class="relative rounded-[36px] overflow-hidden border border-mist-s6 bg-paper-s6 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] card-hover-lift">'
  },
  {
    from: '<div class="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">',
    to: '<div class="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-container">'
  },
  {
    from: '<section id="dashboard-penghimpunan" class="max-w-[1400px] mx-auto px-6 py-10">',
    to: '<section id="dashboard-penghimpunan" class="max-w-[1400px] mx-auto px-6 py-10 reveal-on-scroll">'
  },
  {
    from: '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">',
    to: '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-container">'
  },
  {
    from: '<section id="dashboard-penyaluran" class="max-w-[1400px] mx-auto px-6 py-10">',
    to: '<section id="dashboard-penyaluran" class="max-w-[1400px] mx-auto px-6 py-10 reveal-on-scroll">'
  },
  {
    from: '<section id="program-zis" class="max-w-[1400px] mx-auto px-6 py-10">',
    to: '<section id="program-zis" class="max-w-[1400px] mx-auto px-6 py-10 reveal-on-scroll">'
  },
  {
    from: '<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">',
    to: '<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 stagger-container">'
  },
  {
    from: '<section id="berita" class="max-w-[1400px] mx-auto px-6 py-10">',
    to: '<section id="berita" class="max-w-[1400px] mx-auto px-6 py-10 reveal-on-scroll">'
  },
  {
    from: '<div class="p-6 rounded-[36px] bg-paper-s6 border border-mist-s6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">',
    to: '<div class="p-6 rounded-[36px] bg-paper-s6 border border-mist-s6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover-lift">'
  },
  {
    from: '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">',
    to: '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-container">'
  },
  {
    from: '<div class="p-8 rounded-[36px] bg-paper-s6 border border-mist-s6 space-y-6">',
    to: '<div class="p-8 rounded-[36px] bg-paper-s6 border border-mist-s6 space-y-6 card-hover-lift reveal-right">'
  }
]);

// 2. KalkulatorZakat.astro
patchFile('src/components/public/KalkulatorZakat.astro', [
  {
    from: '<div class="bg-white rounded-[36px] p-6 lg:p-8 custom-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">',
    to: '<div class="bg-white rounded-[36px] p-6 lg:p-8 custom-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<div class="lg:col-span-7 space-y-6">',
    to: '<div class="lg:col-span-7 space-y-6 reveal-left">'
  },
  {
    from: '<div class="lg:col-span-5 space-y-6">',
    to: '<div class="lg:col-span-5 space-y-6 reveal-right">'
  },
  {
    from: '<div class="bg-white rounded-[36px] p-6 lg:p-8 custom-border space-y-6">',
    to: '<div class="bg-white rounded-[36px] p-6 lg:p-8 custom-border space-y-6 card-hover-lift">'
  }
]);

// 3. LayananMustahik.astro
patchFile('src/components/public/LayananMustahik.astro', [
  {
    from: '<section class="bg-[#f4f4f5] border border-cloud rounded-[36px] p-8 sm:p-12 relative overflow-hidden">',
    to: '<section class="bg-[#f4f4f5] border border-cloud rounded-[36px] p-8 sm:p-12 relative overflow-hidden reveal-on-scroll">'
  },
  {
    from: '<div class="grid grid-cols-3 gap-3 w-full lg:w-auto">',
    to: '<div class="grid grid-cols-3 gap-3 w-full lg:w-auto stagger-container">'
  },
  {
    from: '<div class="bg-white border border-cloud rounded-[20px] p-4 text-center min-w-[110px]">',
    to: '<div class="bg-white border border-cloud rounded-[20px] p-4 text-center min-w-[110px] card-hover-lift">'
  },
  {
    from: '<section class="bg-white border border-cloud rounded-[36px] p-8 space-y-6">',
    to: '<section class="bg-white border border-cloud rounded-[36px] p-8 space-y-6 reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">',
    to: '<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start reveal-on-scroll">'
  }
]);

// 4. CommandCenterView.astro
patchFile('src/components/admin/CommandCenterView.astro', [
  {
    from: '<section id="rkat-metrics" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">',
    to: '<section id="rkat-metrics" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-container reveal-on-scroll">'
  },
  {
    from: '<section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">',
    to: '<section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start reveal-on-scroll">'
  },
  {
    from: '<div id="disposisi-queue" class="lg:col-span-8 space-y-6">',
    to: '<div id="disposisi-queue" class="lg:col-span-8 space-y-6 reveal-left">'
  },
  {
    from: '<div class="lg:col-span-4 space-y-6">',
    to: '<div class="lg:col-span-4 space-y-6 reveal-right">'
  },
  {
    from: '<div id="radar-wilayah" class="bg-snow rounded-card border border-cloud p-6 space-y-4">',
    to: '<div id="radar-wilayah" class="bg-snow rounded-card border border-cloud p-6 space-y-4 card-hover-lift">'
  },
  {
    from: '<div id="audit-trail-card" class="bg-snow rounded-card border border-cloud p-6 space-y-4">',
    to: '<div id="audit-trail-card" class="bg-snow rounded-card border border-cloud p-6 space-y-4 card-hover-lift">'
  }
]);

// 5. AsesmenLapanganView.astro
patchFile('src/components/admin/AsesmenLapanganView.astro', [
  {
    from: '<section id="antrean-mustahik" class="bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col gap-6 shadow-xs">',
    to: '<section id="antrean-mustahik" class="bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col gap-6 shadow-xs reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<section class="grid grid-cols-1 lg:grid-cols-12 gap-7">',
    to: '<section class="grid grid-cols-1 lg:grid-cols-12 gap-7 reveal-on-scroll">'
  },
  {
    from: '<div id="gps-geotagging" class="lg:col-span-4 bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col justify-between gap-5">',
    to: '<div id="gps-geotagging" class="lg:col-span-4 bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col justify-between gap-5 card-hover-lift reveal-left">'
  },
  {
    from: '<section class="bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col gap-6">',
    to: '<section class="bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col gap-6 reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<div class="grid grid-cols-1 md:grid-cols-4 gap-4">',
    to: '<div class="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-container">'
  },
  {
    from: '<section id="kalkulator-kifayah" class="bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col gap-6 shadow-xs">',
    to: '<section id="kalkulator-kifayah" class="bg-paper-s4 rounded-card border border-hairline p-7 flex flex-col gap-6 shadow-xs reveal-on-scroll card-hover-lift">'
  }
]);

// 6. KeuanganPsakView.astro
patchFile('src/components/admin/KeuanganPsakView.astro', [
  {
    from: '<div id="segregated-funds">',
    to: '<div id="segregated-funds" class="reveal-on-scroll">'
  },
  {
    from: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">',
    to: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-container">'
  },
  {
    from: '<div id="buku-besar-psak" class="bg-white rounded-[36px] border border-[#ececee] p-8 space-y-6">',
    to: '<div id="buku-besar-psak" class="bg-white rounded-[36px] border border-[#ececee] p-8 space-y-6 reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<section id="neraca-psak" class="bg-white rounded-3xl border border-[#ececee] p-8 space-y-8">',
    to: '<section id="neraca-psak" class="bg-white rounded-3xl border border-[#ececee] p-8 space-y-8 reveal-on-scroll card-hover-lift">'
  }
]);

// 7. UpzDaerahView.astro
patchFile('src/components/admin/UpzDaerahView.astro', [
  {
    from: '<div class="rounded-card bg-snow border border-cloud p-8 lg:p-10 flex flex-col gap-6">',
    to: '<div class="rounded-card bg-snow border border-cloud p-8 lg:p-10 flex flex-col gap-6 reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">',
    to: '<section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 stagger-container reveal-on-scroll">'
  },
  {
    from: '<section class="rounded-card bg-snow border border-cloud p-8 lg:p-10 flex flex-col gap-6">',
    to: '<section class="rounded-card bg-snow border border-cloud p-8 lg:p-10 flex flex-col gap-6 reveal-on-scroll card-hover-lift">'
  },
  {
    from: '<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">',
    to: '<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 reveal-on-scroll">'
  }
]);

console.log('--- All components successfully patched with smooth animation classes ---');
