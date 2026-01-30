#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { UrlReferenceMapper } from './UrlReferenceMapper';
import { UrlMapping, ExportFormat } from './types';
import * as yaml from 'js-yaml';
import { VERSION } from './version';

const program = new Command();

program
  .name('url-ref-mapper')
  .description('CLI tool for managing URL-to-path mappings')
  .version(VERSION);

// Init command
program
  .command('init')
  .description('Create a default url-references.json configuration file')
  .option('-f, --format <format>', 'File format (json or yaml)', 'json')
  .option('-p, --path <path>', 'Output file path', 'url-references.json')
  .action((options) => {
    const filePath = options.path;
    const format = options.format;

    if (fs.existsSync(filePath)) {
      console.error(`Error: File already exists: ${filePath}`);
      process.exit(1);
    }

    const seedData: UrlMapping[] = [
      {
        title: 'Copper ETFs and Investment Vehicles: 2026',
        url: 'https://mytech.today/copper-etfs-and-investment-vehicles-2026/',
        localPath: 'C:\\projects\\blogs\\copper-mining-part-4-etf-investment-vehicles.html',
        lastUpdated: new Date().toISOString(),
      },
      {
        title: 'Mid-Tier & Junior Copper Miners: 2026 Analysis',
        url: 'https://mytech.today/mid-tier-junior-copper-miners-2026-analysis/',
        localPath: 'C:\\projects\\blogs\\copper-mining-part-3-mid-tier-junior-companies.html',
        lastUpdated: new Date().toISOString(),
      },
      {
        title: 'Copper Demand vs Supply: 2026-2040 Outlook',
        url: 'https://mytech.today/copper-demand-vs-supply-2026-2040-outlook/',
        localPath: 'C:\\projects\\blogs\\copper-mining-part-1-demand-supply-outlook.html',
        lastUpdated: new Date().toISOString(),
      },
      {
        title: 'Major Copper Mining Companies Analysis 2026',
        url: 'https://mytech.today/major-copper-mining-companies-analysis-2026/',
        localPath: 'C:\\projects\\blogs\\copper-mining-part-2-major-companies-analysis.html',
        lastUpdated: new Date().toISOString(),
      },
    ];

    const mapper = new UrlReferenceMapper({ mappings: seedData });

    const outputPath = format === 'yaml' ? filePath.replace(/\.json$/, '.yaml') : filePath;
    mapper.save(outputPath);

    console.log(`✓ Created ${outputPath} with ${seedData.length} seed mappings`);
  });

// Add command
program
  .command('add')
  .description('Add a new URL-to-path mapping')
  .requiredOption('-t, --title <title>', 'Title of the mapping')
  .requiredOption('-u, --url <url>', 'Published URL')
  .requiredOption('-p, --path <path>', 'Local filesystem path')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .action((options) => {
    const mapper = new UrlReferenceMapper({
      configPath: options.config,
      autoSave: true,
    });

    const mapping: UrlMapping = {
      title: options.title,
      url: options.url,
      localPath: options.path,
      lastUpdated: new Date().toISOString(),
    };

    try {
      mapper.addMapping(mapping);
      console.log(`✓ Added mapping: ${options.title}`);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Get URL command
program
  .command('get-url <localPath>')
  .description('Get published URL from local path')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .action((localPath, options) => {
    const mapper = new UrlReferenceMapper({ configPath: options.config });
    const url = mapper.getUrlFromLocalPath(localPath);

    if (url) {
      console.log(url);
    } else {
      console.error(`No URL found for path: ${localPath}`);
      process.exit(1);
    }
  });

// Get path command
program
  .command('get-path <url>')
  .description('Get local path from published URL')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .action((url, options) => {
    const mapper = new UrlReferenceMapper({ configPath: options.config });
    const localPath = mapper.getLocalPathFromUrl(url);

    if (localPath) {
      console.log(localPath);
    } else {
      console.error(`No local path found for URL: ${url}`);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all URL-to-path mappings')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .option('-f, --format <format>', 'Output format (table, json, yaml)', 'table')
  .action((options) => {
    const mapper = new UrlReferenceMapper({ configPath: options.config });
    const mappings = mapper.getAllMappings();

    if (mappings.length === 0) {
      console.log('No mappings found.');
      return;
    }

    const format = options.format.toLowerCase();

    if (format === 'json') {
      console.log(JSON.stringify(mappings, null, 2));
    } else if (format === 'yaml') {
      console.log(yaml.dump(mappings));
    } else if (format === 'table') {
      // Table format
      console.log('\nURL Mappings:\n');
      mappings.forEach((mapping, index) => {
        console.log(`${index + 1}. ${mapping.title}`);
        console.log(`   URL:  ${mapping.url}`);
        console.log(`   Path: ${mapping.localPath}`);
        if (mapping.lastUpdated) {
          console.log(`   Last Updated: ${mapping.lastUpdated}`);
        }
        console.log('');
      });
      console.log(`Total: ${mappings.length} mapping(s)`);
    } else {
      console.error(
        `Error: Unsupported format '${options.format}'. Use 'table', 'json', or 'yaml'.`
      );
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate all mappings in the configuration file')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .action((options) => {
    const mapper = new UrlReferenceMapper({ configPath: options.config });
    const result = mapper.validate();

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach((w) => console.log(`  ⚠ [${w.type}] ${w.message}`));
    }

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach((e) => console.log(`  ✗ [${e.type}] ${e.message}`));
      process.exit(1);
    }

    console.log('\n✓ All mappings are valid');
  });

// Update command
program
  .command('update <url>')
  .description('Update an existing URL-to-path mapping')
  .option('-t, --title <title>', 'New title of the mapping')
  .option('-u, --new-url <newUrl>', 'New published URL')
  .option('-p, --path <path>', 'New local filesystem path')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .action((url, options) => {
    const mapper = new UrlReferenceMapper({
      configPath: options.config,
      autoSave: true,
    });

    const updates: Partial<UrlMapping> = {};

    if (options.title) updates.title = options.title;
    if (options.newUrl) updates.url = options.newUrl;
    if (options.path) updates.localPath = options.path;

    if (Object.keys(updates).length === 0) {
      console.error('Error: No updates specified. Use --title, --new-url, or --path');
      process.exit(1);
    }

    try {
      mapper.updateMapping(url, updates);
      console.log(`✓ Updated mapping for: ${url}`);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Delete command
program
  .command('delete <url>')
  .description('Delete a URL-to-path mapping')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .action((url, options) => {
    const mapper = new UrlReferenceMapper({
      configPath: options.config,
      autoSave: true,
    });

    try {
      const removed = mapper.removeMapping(url);
      if (removed) {
        console.log(`✓ Deleted mapping for: ${url}`);
      } else {
        console.error(`Error: No mapping found for URL: ${url}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Export command
program
  .command('export')
  .description('Export mappings to different formats')
  .option('-c, --config <config>', 'Config file path', 'url-references.json')
  .option('-f, --format <format>', 'Export format (json, yaml, csv)', 'json')
  .option('-o, --output <output>', 'Output file path (optional)')
  .action((options) => {
    const mapper = new UrlReferenceMapper({ configPath: options.config });
    const format = options.format as ExportFormat;

    try {
      const output = mapper.export(format);

      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        console.log(`✓ Exported to ${options.output}`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Uninstall command
program
  .command('uninstall')
  .description('Uninstall the URL reference mapper from the system')
  .option('-g, --global', 'Uninstall globally installed package', false)
  .option('-y, --yes', 'Skip confirmation prompt', false)
  .action((options) => {
    const packageName = '@mytechtoday/url-reference-mapper';
    const isGlobal = options.global;
    const skipConfirm = options.yes;

    console.log(`\nUninstalling ${packageName}${isGlobal ? ' (global)' : ' (local)'}...\n`);

    // Confirmation prompt
    if (!skipConfirm) {
      console.log('⚠️  This will remove the package from your system.');
      console.log('   To proceed, run this command with the --yes flag:\n');
      console.log(`   url-ref-mapper uninstall${isGlobal ? ' --global' : ''} --yes\n`);
      process.exit(0);
    }

    try {
      const uninstallCmd = isGlobal
        ? `npm uninstall -g ${packageName}`
        : `npm uninstall ${packageName}`;

      console.log(`Running: ${uninstallCmd}\n`);
      execSync(uninstallCmd, { stdio: 'inherit' });

      console.log(`\n✓ Successfully uninstalled ${packageName}`);

      if (isGlobal) {
        console.log('  The url-ref-mapper command is no longer available globally.');
      } else {
        console.log('  The package has been removed from your project dependencies.');
      }
    } catch (error) {
      console.error(`\n✗ Failed to uninstall ${packageName}`);
      console.error(`  ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Self-update command
program
  .command('self-update')
  .description('Update the URL reference mapper CLI to the latest version')
  .option('-g, --global', 'Update global installation', false)
  .action((options) => {
    const packageName = '@mytechtoday/url-reference-mapper';
    const isGlobal = options.global;

    console.log(`\nChecking for updates to ${packageName}...\n`);

    try {
      // Get current version
      const currentVersion = program.version();
      console.log(`Current version: ${currentVersion}`);

      // Get latest version from npm
      const latestVersionCmd = `npm view ${packageName} version`;
      const latestVersion = execSync(latestVersionCmd, { encoding: 'utf-8' }).trim();
      console.log(`Latest version:  ${latestVersion}\n`);

      if (currentVersion === latestVersion) {
        console.log('✓ You are already using the latest version!');
        process.exit(0);
      }

      // Update the package
      const updateCmd = isGlobal
        ? `npm install -g ${packageName}@latest`
        : `npm install ${packageName}@latest`;

      console.log(`Updating from v${currentVersion} to v${latestVersion}...\n`);
      console.log(`Running: ${updateCmd}\n`);
      execSync(updateCmd, { stdio: 'inherit' });

      console.log(`\n✓ Successfully updated to v${latestVersion}`);

      if (isGlobal) {
        console.log('  Run "url-ref-mapper --version" to verify the update.');
      } else {
        console.log('  The package has been updated in your project dependencies.');
      }
    } catch (error) {
      console.error(`\n✗ Failed to update ${packageName}`);
      console.error(`  ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Version command (explicit command in addition to --version flag)
program
  .command('version')
  .description('Display the current version of the URL reference mapper')
  .action(() => {
    console.log(`url-ref-mapper version ${VERSION}`);
    console.log(`Package: @mytechtoday/url-reference-mapper`);
  });

program.parse();
