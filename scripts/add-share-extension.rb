# Adds the ShareExtension target to ios/App/App.xcodeproj (idempotent).
# Run: ruby scripts/add-share-extension.rb
require 'xcodeproj'

proj_path = File.expand_path('../ios/App/App.xcodeproj', __dir__)
project = Xcodeproj::Project.open(proj_path)
app = project.targets.find { |t| t.name == 'App' }
raise 'App target not found' unless app

if project.targets.any? { |t| t.name == 'ShareExtension' }
  puts 'ShareExtension target already exists — nothing to do'
  exit 0
end

ext = project.new_target(:app_extension, 'ShareExtension', :ios, '15.0')

# Files live in ios/App/ShareExtension/
group = project.main_group.find_subpath('ShareExtension', true)
group.set_source_tree('<group>')
group.set_path('ShareExtension')
src = group.new_file('ShareViewController.swift')
group.new_file('Info.plist')
ext.add_file_references([src])

team = "NG6DBB2567"
ext.build_configurations.each do |cfg|
  bs = cfg.build_settings
  bs['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.glutenfreemadeeasy.app.ShareExtension'
  bs['PRODUCT_NAME'] = 'ShareExtension'
  bs['INFOPLIST_FILE'] = 'ShareExtension/Info.plist'
  bs['GENERATE_INFOPLIST_FILE'] = 'NO'
  bs['INFOPLIST_KEY_CFBundleDisplayName'] = 'Sift'
  bs['DEVELOPMENT_TEAM'] = team
  bs['CODE_SIGN_STYLE'] = 'Automatic'
  bs['SWIFT_VERSION'] = '5.0'
  bs['TARGETED_DEVICE_FAMILY'] = '1'
  bs['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
  bs['MARKETING_VERSION'] = '1.2'
  bs['CURRENT_PROJECT_VERSION'] = '4'
  bs['SKIP_INSTALL'] = 'YES'
  bs['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
  bs['SWIFT_EMIT_LOC_STRINGS'] = 'YES'
end

# App depends on + embeds the extension.
app.add_dependency(ext)
embed = app.copy_files_build_phases.find { |p| p.name == 'Embed Foundation Extensions' } ||
        app.new_copy_files_build_phase('Embed Foundation Extensions')
embed.dst_subfolder_spec = '13' # PlugIns
embed.dst_path = ''
bf = embed.add_file_reference(ext.product_reference)
bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

project.save
puts "Added ShareExtension target (team #{team})"
